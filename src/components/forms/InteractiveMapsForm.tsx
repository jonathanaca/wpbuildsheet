import React, { useState, useRef } from 'react';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import type { FloorPlan, MapOverlay, DesignElement, DesignElementType } from '../../types/buildsheet.types';
import { Upload, Download, Trash2, MapPin, Square, Home, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, RotateCw, Edit3, Type, Armchair, DoorOpen, Building2, Table, TreePine, X } from 'lucide-react';

type EditorMode = 'data' | 'design';
type SidebarTab = 'zones' | 'rooms' | 'desks';

export const InteractiveMapsForm: React.FC = () => {
  const org = useBuildSheetStore((state) => state.org);
  const zones = useBuildSheetStore((state) => state.zones);
  const rooms = useBuildSheetStore((state) => state.rooms);
  const desks = useBuildSheetStore((state) => state.desks);
  const interactiveMaps = useBuildSheetStore((state) => state.interactiveMaps);
  const addFloorPlan = useBuildSheetStore((state) => state.addFloorPlan);
  const updateFloorPlan = useBuildSheetStore((state) => state.updateFloorPlan);
  const deleteFloorPlan = useBuildSheetStore((state) => state.deleteFloorPlan);
  const addOverlay = useBuildSheetStore((state) => state.addOverlay);
  const updateOverlay = useBuildSheetStore((state) => state.updateOverlay);
  const deleteOverlay = useBuildSheetStore((state) => state.deleteOverlay);
  const addDesignElement = useBuildSheetStore((state) => state.addDesignElement);
  const updateDesignElement = useBuildSheetStore((state) => state.updateDesignElement);
  const deleteDesignElement = useBuildSheetStore((state) => state.deleteDesignElement);
  const deleteSvgElement = useBuildSheetStore((state) => state.deleteSvgElement);

  const [editorMode, setEditorMode] = useState<EditorMode>('data');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('desks');
  const [selectedDesignTool, setSelectedDesignTool] = useState<DesignElementType | null>(null);
  const [selectedDesignElement, setSelectedDesignElement] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedSvgElement, setSelectedSvgElement] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'zone' | 'room' | 'desk' } | null>(null);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [rotationStart, setRotationStart] = useState<{ angle: number; mouseAngle: number } | null>(null);

  // Design element resizing
  const [isResizingDesignElement, setIsResizingDesignElement] = useState(false);
  const [designElementResizeStart, setDesignElementResizeStart] = useState<{ size: number; mouseY: number } | null>(null);

  // 3D view mode
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Zoom state
  const [zoom, setZoom] = useState(1);

  // Layer visibility
  const [layersVisible, setLayersVisible] = useState({
    zones: true,
    rooms: true,
    desks: true,
  });

  // Remember last resized dimensions
  const [lastResizedSize, setLastResizedSize] = useState<{ width: number; height: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current floor plan for selected building/level
  const currentFloorPlan = interactiveMaps.floorPlans.find(
    (fp) => fp.building === selectedBuilding && fp.level === selectedLevel
  );

  // Get available levels for selected building
  const availableLevels = selectedBuilding
    ? org.buildings.find((b) => b.buildingName === selectedBuilding)?.floor || 0
    : 0;

  // Filter data by selected building and level
  const filteredZones = zones.filter(
    (z) => z.building === selectedBuilding && z.level === selectedLevel
  );
  const filteredRooms = rooms.filter(
    (r) => r.building === selectedBuilding && r.floor === selectedLevel
  );
  const filteredDesks = desks.filter(
    (d) => d.building === selectedBuilding && d.floor === selectedLevel
  );

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBuilding || selectedLevel === '') return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      const fileType = file.name.endsWith('.svg') ? 'svg' : 'pdf';

      const newFloorPlan: FloorPlan = {
        building: selectedBuilding,
        level: selectedLevel as number,
        fileName: file.name,
        fileType,
        fileData,
        overlays: [],
      };

      // Parse SVG content for editing if it's an SVG file
      if (fileType === 'svg') {
        const base64Data = fileData.split(',')[1];
        const svgContent = atob(base64Data);
        newFloorPlan.svgContent = svgContent;
        newFloorPlan.deletedSvgElements = [];
      }

      if (currentFloorPlan) {
        // Keep existing overlays and design elements when updating floor plan
        newFloorPlan.overlays = currentFloorPlan.overlays;
        newFloorPlan.designElements = currentFloorPlan.designElements;
        updateFloorPlan(selectedBuilding, selectedLevel as number, newFloorPlan);
      } else {
        addFloorPlan(newFloorPlan);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle drag start from sidebar
  const handleDragStart = (id: string, type: 'zone' | 'room' | 'desk') => {
    setDraggedItem({ id, type });
  };

  // Handle drop on canvas
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggedItem || !currentFloorPlan || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    // Account for zoom when calculating drop position
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Check if overlay already exists
    const existingOverlay = currentFloorPlan.overlays.find((o) => o.id === draggedItem.id);
    if (existingOverlay) {
      alert('This item is already placed on the map. Delete it first to reposition.');
      setDraggedItem(null);
      return;
    }

    // Determine size: use last resized size if available, otherwise defaults
    let width: number;
    let height: number;

    if (lastResizedSize) {
      // Use the last resized dimensions
      width = lastResizedSize.width;
      height = lastResizedSize.height;
    } else {
      // Default sizes - smaller for desks
      if (draggedItem.type === 'zone') {
        width = 200;
        height = 150;
      } else if (draggedItem.type === 'room') {
        width = 80;
        height = 60;
      } else {
        // Desks - much smaller by default
        width = 40;
        height = 30;
      }
    }

    const newOverlay: MapOverlay = {
      id: draggedItem.id,
      type: draggedItem.type,
      shape: 'rectangle',
      x,
      y,
      width,
      height,
      rotation: 0,
      visible: true,
    };

    addOverlay(selectedBuilding, selectedLevel as number, newOverlay);
    setDraggedItem(null);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Handle overlay selection and drag start
  const handleOverlayClick = (overlayId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedOverlay(overlayId);
  };

  const handleOverlayDragStart = (overlayId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedOverlay(overlayId);
    setIsDraggingOverlay(true);

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;
    setDragStartPos({ x, y });
  };

  // Handle overlay deletion
  const handleDeleteOverlay = (overlayId: string) => {
    if (!currentFloorPlan) return;
    deleteOverlay(selectedBuilding, selectedLevel as number, overlayId);
    setSelectedOverlay(null);
  };

  // Layer visibility toggle
  const toggleLayerVisibility = (layer: 'zones' | 'rooms' | 'desks') => {
    setLayersVisible((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Handle rotation start
  const handleRotationStart = (overlayId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedOverlay(overlayId);
    setIsRotating(true);

    const overlay = currentFloorPlan?.overlays.find((o) => o.id === overlayId);
    if (!overlay || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = overlay.x + overlay.width / 2;
    const centerY = overlay.y + overlay.height / 2;
    const mouseX = (event.clientX - rect.left) / zoom;
    const mouseY = (event.clientY - rect.top) / zoom;

    const mouseAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    setRotationStart({ angle: overlay.rotation, mouseAngle });
  };

  // Convert overlay to polygon mode (enables point editing)
  const convertToPolygon = (overlayId: string) => {
    if (!currentFloorPlan) return;

    const overlay = currentFloorPlan.overlays.find((o) => o.id === overlayId);
    if (!overlay || overlay.shape === 'polygon') return;

    // Create rectangle corners as polygon points
    const points = [
      { x: 0, y: 0 },
      { x: overlay.width, y: 0 },
      { x: overlay.width, y: overlay.height },
      { x: 0, y: overlay.height },
    ];

    const updatedOverlay: MapOverlay = {
      ...overlay,
      shape: 'polygon',
      points,
      rotation: 0, // Reset rotation when converting to polygon
    };

    updateOverlay(selectedBuilding, selectedLevel as number, overlayId, updatedOverlay);
  };

  // Design Mode: Handle canvas click to place element
  const handleDesignCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (editorMode !== 'design' || !selectedDesignTool || !canvasRef.current || !currentFloorPlan) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    if (selectedDesignTool === 'text') {
      // Show text input dialog
      setIsEditingText(true);
      setTextInput('');
      return;
    }

    // Handle 3D objects with dimensions
    if (selectedDesignTool === '3d-desk' || selectedDesignTool === '3d-meeting-table') {
      const newElement: DesignElement = {
        id: `design-${Date.now()}`,
        type: selectedDesignTool,
        x,
        y,
        rotation: 0,
        width: selectedDesignTool === '3d-desk' ? 120 : 200,
        height: selectedDesignTool === '3d-desk' ? 60 : 120,
        color: '#8B4513', // Wood color
        deskId: '', // Empty by default, can be assigned in Data Mode
      };
      addDesignElement(selectedBuilding, selectedLevel as number, newElement);
      setSelectedDesignTool(null);
      return;
    }

    // Place regular icon
    const newElement: DesignElement = {
      id: `design-${Date.now()}`,
      type: selectedDesignTool,
      x,
      y,
      rotation: 0,
      size: 24,
      color: '#333333',
    };

    addDesignElement(selectedBuilding, selectedLevel as number, newElement);
    setSelectedDesignTool(null); // Deselect tool after placing
  };

  // Add text element after input
  const handleAddText = () => {
    if (!textInput.trim() || !canvasRef.current || !currentFloorPlan) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 / zoom;
    const centerY = rect.height / 2 / zoom;

    const newElement: DesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: centerX,
      y: centerY,
      rotation: 0,
      text: textInput,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
    };

    addDesignElement(selectedBuilding, selectedLevel as number, newElement);
    setIsEditingText(false);
    setTextInput('');
    setSelectedDesignTool(null);
  };

  // Render icon based on type
  const renderIcon = (type: DesignElementType, size: number = 24, color: string = '#333') => {
    const iconProps = { size, color, strokeWidth: 1.5 };
    switch (type) {
      case 'desk-icon':
        return <Square {...iconProps} />;
      case 'chair-icon':
        return <Armchair {...iconProps} />;
      case 'toilet-icon':
        return <DoorOpen {...iconProps} />;
      case 'stairs-icon':
        return <Building2 {...iconProps} />;
      case 'exit-icon':
        return <DoorOpen {...iconProps} />;
      case 'elevator-icon':
        return <Building2 {...iconProps} />;
      case 'plant-icon':
        return <TreePine {...iconProps} />;
      case 'table-icon':
        return <Table {...iconProps} />;
      default:
        return <Square {...iconProps} />;
    }
  };

  // Handle design element click
  const handleDesignElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedDesignElement(elementId);
  };

  // Handle design element drag
  const handleDesignElementDrag = (elementId: string, event: React.MouseEvent) => {
    if (!currentFloorPlan || selectedDesignElement !== elementId || isResizingDesignElement) return;

    const element = (currentFloorPlan.designElements || []).find((e) => e.id === elementId);
    if (!element || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    const updatedElement: DesignElement = {
      ...element,
      x,
      y,
    };

    updateDesignElement(selectedBuilding, selectedLevel as number, elementId, updatedElement);
  };

  // Handle design element resize start
  const handleDesignElementResizeStart = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const element = currentFloorPlan?.designElements?.find((e) => e.id === elementId);
    if (!element) return;

    setIsResizingDesignElement(true);
    setSelectedDesignElement(elementId);
    setDesignElementResizeStart({
      size: element.size || 24,
      mouseY: event.clientY,
    });
  };

  // Handle design element resize
  const handleDesignElementResize = (event: React.MouseEvent) => {
    if (!isResizingDesignElement || !designElementResizeStart || !selectedDesignElement || !currentFloorPlan) return;

    const element = currentFloorPlan.designElements?.find((e) => e.id === selectedDesignElement);
    if (!element || element.type === 'text') return;

    const deltaY = event.clientY - designElementResizeStart.mouseY;
    const newSize = Math.max(12, Math.min(120, designElementResizeStart.size - deltaY / 2));

    const updatedElement: DesignElement = {
      ...element,
      size: newSize,
    };

    updateDesignElement(selectedBuilding, selectedLevel as number, selectedDesignElement, updatedElement);
  };

  // Handle design element color change
  const handleDesignElementColorChange = (elementId: string, color: string) => {
    const element = currentFloorPlan?.designElements?.find((e) => e.id === elementId);
    if (!element) return;

    const updatedElement: DesignElement = {
      ...element,
      color,
    };

    updateDesignElement(selectedBuilding, selectedLevel as number, elementId, updatedElement);
  };

  // Handle desk ID assignment for 3D objects
  const handleDeskIdChange = (elementId: string, deskId: string) => {
    const element = currentFloorPlan?.designElements?.find((e) => e.id === elementId);
    if (!element) return;

    const updatedElement: DesignElement = {
      ...element,
      deskId,
    };

    updateDesignElement(selectedBuilding, selectedLevel as number, elementId, updatedElement);
  };

  // Handle resize start
  const handleResizeStart = (overlayId: string, handle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedOverlay(overlayId);
    setIsResizing(true);
    setResizeHandle(handle);
  };

  // Handle mouse move for resizing and dragging
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // Handle design element resizing
    if (isResizingDesignElement) {
      handleDesignElementResize(event);
      return;
    }

    if (!selectedOverlay || !currentFloorPlan || !canvasRef.current) return;

    const overlay = currentFloorPlan.overlays.find((o) => o.id === selectedOverlay);
    if (!overlay) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / zoom;
    const mouseY = (event.clientY - rect.top) / zoom;

    // Handle dragging overlay
    if (isDraggingOverlay && dragStartPos) {
      const deltaX = mouseX - dragStartPos.x;
      const deltaY = mouseY - dragStartPos.y;

      const updatedOverlay: MapOverlay = {
        ...overlay,
        x: overlay.x + deltaX,
        y: overlay.y + deltaY,
      };

      updateOverlay(selectedBuilding, selectedLevel as number, selectedOverlay, updatedOverlay);
      setDragStartPos({ x: mouseX, y: mouseY });
      return;
    }

    // Handle rotation
    if (isRotating && rotationStart) {
      const centerX = overlay.x + overlay.width / 2;
      const centerY = overlay.y + overlay.height / 2;
      const currentMouseAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
      const angleDelta = currentMouseAngle - rotationStart.mouseAngle;
      let newRotation = rotationStart.angle + angleDelta;

      // Normalize rotation to 0-360
      while (newRotation < 0) newRotation += 360;
      while (newRotation >= 360) newRotation -= 360;

      const updatedOverlay: MapOverlay = {
        ...overlay,
        rotation: newRotation,
      };

      updateOverlay(selectedBuilding, selectedLevel as number, selectedOverlay, updatedOverlay);
      return;
    }

    // Handle resizing
    if (!isResizing) return;

    let newWidth = overlay.width;
    let newHeight = overlay.height;
    let newX = overlay.x;
    let newY = overlay.y;

    // Minimum sizes - smaller for desks
    const minWidth = overlay.type === 'desk' ? 15 : 40;
    const minHeight = overlay.type === 'desk' ? 15 : 30;

    // Resize based on handle
    if (resizeHandle.includes('e')) {
      newWidth = Math.max(minWidth, mouseX - overlay.x);
    }
    if (resizeHandle.includes('s')) {
      newHeight = Math.max(minHeight, mouseY - overlay.y);
    }
    if (resizeHandle.includes('w')) {
      const newRight = overlay.x + overlay.width;
      newX = Math.min(mouseX, newRight - minWidth);
      newWidth = newRight - newX;
    }
    if (resizeHandle.includes('n')) {
      const newBottom = overlay.y + overlay.height;
      newY = Math.min(mouseY, newBottom - minHeight);
      newHeight = newBottom - newY;
    }

    const updatedOverlay: MapOverlay = {
      ...overlay,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    // Remember the last resized size
    setLastResizedSize({ width: newWidth, height: newHeight });

    updateOverlay(selectedBuilding, selectedLevel as number, selectedOverlay, updatedOverlay);
  };

  // Handle mouse up to stop resizing, dragging, and rotating
  const handleMouseUp = () => {
    setIsResizing(false);
    setIsDraggingOverlay(false);
    setIsRotating(false);
    setResizeHandle('');
    setDragStartPos(null);
    setRotationStart(null);
    setIsResizingDesignElement(false);
    setDesignElementResizeStart(null);
  };

  // Handle export to SVG
  const handleExportSVG = () => {
    if (!currentFloorPlan) return;

    // Create SVG with floor plan as background and overlays
    let svgContent = '';

    if (currentFloorPlan.fileType === 'svg') {
      // Extract SVG content
      const base64Data = currentFloorPlan.fileData.split(',')[1];
      svgContent = atob(base64Data);
    } else {
      // For PDF, we'll create a simple placeholder
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800">
        <rect width="1000" height="800" fill="#f0f0f0"/>
        <text x="500" y="400" text-anchor="middle" font-size="24" fill="#666">Floor Plan Background (PDF)</text>
      </svg>`;
    }

    // Parse the SVG to add overlays
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Remove deleted SVG elements if any
    if (currentFloorPlan.deletedSvgElements && currentFloorPlan.deletedSvgElements.length > 0) {
      currentFloorPlan.deletedSvgElements.forEach((elementId) => {
        const element = svgDoc.getElementById(elementId);
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    }

    // Add overlays group
    const overlaysGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
    overlaysGroup.setAttribute('id', 'placeos-overlays');

    currentFloorPlan.overlays.forEach((overlay) => {
      // Skip invisible overlays
      if (overlay.visible === false) return;

      const group = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('id', overlay.id);
      group.setAttribute('data-type', overlay.type);
      group.setAttribute('data-shape', overlay.shape);

      if (overlay.shape === 'polygon' && overlay.points) {
        // Polygon shape
        const polygon = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const pointsString = overlay.points
          .map((p) => `${overlay.x + p.x},${overlay.y + p.y}`)
          .join(' ');
        polygon.setAttribute('points', pointsString);
        polygon.setAttribute('fill', 'rgba(100, 100, 100, 0.3)');
        polygon.setAttribute('stroke', '#333');
        polygon.setAttribute('stroke-width', '2');
        polygon.setAttribute('class', 'placeos-overlay-box');

        group.appendChild(polygon);

        // Text label at center of bounding box
        const text = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (overlay.x + overlay.width / 2).toString());
        text.setAttribute('y', (overlay.y + overlay.height / 2).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#000');
        text.setAttribute('class', 'placeos-overlay-label');
        text.textContent = overlay.id;

        group.appendChild(text);
      } else {
        // Rectangle shape with rotation
        const rect = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', overlay.x.toString());
        rect.setAttribute('y', overlay.y.toString());
        rect.setAttribute('width', overlay.width.toString());
        rect.setAttribute('height', overlay.height.toString());
        rect.setAttribute('fill', 'rgba(100, 100, 100, 0.3)');
        rect.setAttribute('stroke', '#333');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('class', 'placeos-overlay-box');

        // Apply rotation transform if needed
        if (overlay.rotation && overlay.rotation !== 0) {
          const centerX = overlay.x + overlay.width / 2;
          const centerY = overlay.y + overlay.height / 2;
          rect.setAttribute('transform', `rotate(${overlay.rotation} ${centerX} ${centerY})`);
        }

        group.appendChild(rect);

        // Text label
        const text = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (overlay.x + overlay.width / 2).toString());
        text.setAttribute('y', (overlay.y + overlay.height / 2).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#000');
        text.setAttribute('class', 'placeos-overlay-label');
        text.textContent = overlay.id;

        // Apply same rotation to text
        if (overlay.rotation && overlay.rotation !== 0) {
          const centerX = overlay.x + overlay.width / 2;
          const centerY = overlay.y + overlay.height / 2;
          text.setAttribute('transform', `rotate(${overlay.rotation} ${centerX} ${centerY})`);
        }

        group.appendChild(text);
      }

      overlaysGroup.appendChild(group);
    });

    svgElement.appendChild(overlaysGroup);

    // Add design elements group if any
    if (currentFloorPlan.designElements && currentFloorPlan.designElements.length > 0) {
      const designGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      designGroup.setAttribute('id', 'design-elements');

      currentFloorPlan.designElements.forEach((element) => {
        if (element.type === 'text') {
          // Text element
          const text = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', element.x.toString());
          text.setAttribute('y', element.y.toString());
          text.setAttribute('font-size', (element.fontSize || 16).toString());
          text.setAttribute('font-weight', element.fontWeight || 'normal');
          text.setAttribute('fill', element.color || '#333333');
          if (element.rotation && element.rotation !== 0) {
            text.setAttribute('transform', `rotate(${element.rotation} ${element.x} ${element.y})`);
          }
          text.textContent = element.text || '';
          designGroup.appendChild(text);
        } else {
          // Icon element - export as circle with text label for now
          // In a production app, you'd want to embed proper icon SVGs
          const group = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
          const iconSize = element.size || 24;

          const circle = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', element.x.toString());
          circle.setAttribute('cy', element.y.toString());
          circle.setAttribute('r', (iconSize / 2).toString());
          circle.setAttribute('fill', element.color || '#333333');
          circle.setAttribute('opacity', '0.3');

          const text = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', element.x.toString());
          text.setAttribute('y', (element.y + 4).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '10');
          text.setAttribute('fill', '#000');
          text.textContent = element.type.replace('-icon', '').toUpperCase();

          if (element.rotation && element.rotation !== 0) {
            group.setAttribute('transform', `rotate(${element.rotation} ${element.x} ${element.y})`);
          }

          group.appendChild(circle);
          group.appendChild(text);
          designGroup.appendChild(group);
        }
      });

      svgElement.appendChild(designGroup);
    }

    // Serialize and download
    const serializer = new XMLSerializer();
    const finalSVG = serializer.serializeToString(svgDoc);
    const blob = new Blob([finalSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedBuilding}-Level${selectedLevel}-interactive.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Interactive Maps</h2>
        <div className="flex items-center gap-3">
          {/* 3D View Toggle */}
          {currentFloorPlan && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all text-sm ${
                  viewMode === '2d'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow'
                    : 'bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-500'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all text-sm ${
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow'
                    : 'bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-500'
                }`}
              >
                3D
              </button>
            </div>
          )}
          {currentFloorPlan && (
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export SVG
            </button>
          )}
        </div>
      </div>

      {/* Tab-Based Mode Switcher */}
      <div className="glass rounded-xl p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setEditorMode('data')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              editorMode === 'data'
                ? 'bg-gradient-to-r from-primary to-primary/80 dark:from-electric-cyan dark:to-electric-cyan/80 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>Data Mode</span>
              <span className="text-xs opacity-75">Zones, Rooms, Desks</span>
            </div>
          </button>
          <button
            onClick={() => setEditorMode('design')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              editorMode === 'design'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
            }`}
          >
            <Edit3 className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>Design Mode</span>
              <span className="text-xs opacity-75">Floor Plan Design & 3D Objects</span>
            </div>
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Building Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Building</label>
            <select
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setSelectedLevel('');
              }}
              className="w-full px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-electric-cyan focus:border-transparent transition-all"
            >
              <option value="">Select Building</option>
              {org.buildings.map((building) => (
                <option key={building.buildingName} value={building.buildingName}>
                  {building.buildingName}
                </option>
              ))}
            </select>
          </div>

          {/* Level Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Level (Floor)</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : '')}
              disabled={!selectedBuilding}
              className="w-full px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-electric-cyan focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Level</option>
              {Array.from({ length: availableLevels }, (_, i) => i + 1).map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Upload */}
        {selectedBuilding && selectedLevel !== '' && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-primary/30 dark:border-electric-cyan/30 rounded-lg cursor-pointer hover:border-primary dark:hover:border-electric-cyan transition-all">
              <Upload className="w-5 h-5" />
              <span className="font-medium">
                {currentFloorPlan ? 'Replace Floor Plan' : 'Upload Floor Plan'}
              </span>
              <span className="text-sm text-gray-500">(SVG or PDF)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {currentFloorPlan && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Current: {currentFloorPlan.fileName}
                </span>
                <button
                  onClick={() => deleteFloorPlan(selectedBuilding, selectedLevel as number)}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      {currentFloorPlan && (
        <div className="grid grid-cols-12 gap-6">
          {/* Canvas Area */}
          <div className="col-span-12 lg:col-span-8">
            <div className="glass rounded-xl p-4">
              {/* Toolbar */}
              <div className="space-y-3 mb-4">
                {/* Zoom Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.25}
                      className="p-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium px-3 py-1 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-lg min-w-[70px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="p-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleResetZoom}
                      className="p-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                      title="Reset Zoom"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Layer Visibility Toggles */}
                {editorMode === 'data' && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Layers:</span>
                    <button
                      onClick={() => toggleLayerVisibility('zones')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                        layersVisible.zones
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                          : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {layersVisible.zones ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      Zones
                    </button>
                    <button
                      onClick={() => toggleLayerVisibility('rooms')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                        layersVisible.rooms
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                          : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {layersVisible.rooms ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      Rooms
                    </button>
                    <button
                      onClick={() => toggleLayerVisibility('desks')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                        layersVisible.desks
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                          : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {layersVisible.desks ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      Desks
                    </button>
                  </div>
                )}
              </div>

              <div
                ref={canvasRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={(e) => {
                  if (editorMode === 'design' && selectedDesignTool) {
                    handleDesignCanvasClick(e);
                  } else {
                    setSelectedOverlay(null);
                    setSelectedDesignElement(null);
                  }
                }}
                className="relative w-full bg-white dark:bg-dark-900 rounded-lg overflow-auto"
                style={{
                  minHeight: '600px',
                  cursor: isResizing ? 'nwse-resize' : isDraggingOverlay ? 'grabbing' : isRotating ? 'grabbing' : 'default',
                  perspective: viewMode === '3d' ? '2000px' : undefined,
                }}
              >
                <div
                  className="relative origin-top-left"
                  style={{
                    transform: viewMode === '3d'
                      ? `scale(${zoom}) rotateX(45deg) rotateZ(-5deg) translateY(100px)`
                      : `scale(${zoom})`,
                    transformOrigin: 'top left',
                    transformStyle: viewMode === '3d' ? 'preserve-3d' : undefined,
                    width: '100%',
                    minHeight: '600px',
                  }}
                >
                {/* Floor Plan Background */}
                {currentFloorPlan.fileType === 'svg' ? (
                  editorMode === 'design' && currentFloorPlan.svgContent ? (
                    // Editable SVG in Design Mode
                    <>
                      <style dangerouslySetInnerHTML={{
                        __html: `
                          ${(currentFloorPlan.deletedSvgElements || []).map(id => `#${id} { display: none !important; }`).join('\n')}
                          ${selectedSvgElement ? `#${selectedSvgElement} { stroke: #a855f7 !important; stroke-width: 3 !important; filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.5)); cursor: pointer; }` : ''}
                          svg path, svg rect, svg circle, svg ellipse, svg polygon, svg polyline, svg line { cursor: pointer; transition: stroke 0.2s, stroke-width 0.2s; }
                          svg path:hover, svg rect:hover, svg circle:hover, svg ellipse:hover, svg polygon:hover, svg polyline:hover, svg line:hover { stroke: #c084fc !important; stroke-width: 2 !important; }
                        `
                      }} />
                      <div
                        className="absolute inset-0 w-full h-full"
                        dangerouslySetInnerHTML={{
                          __html: currentFloorPlan.svgContent
                            .replace(/<svg/, `<svg class="w-full h-full object-contain"`)
                            // Add IDs to elements that don't have them
                            .replace(/<(path|rect|circle|ellipse|polygon|polyline|line)(?!\s+id=)/g, (match) => {
                              const id = `svg-elem-${Math.random().toString(36).substr(2, 9)}`;
                              return `${match} id="${id}"`;
                            })
                        }}
                        onClick={(e) => {
                          if (editorMode === 'design') {
                            const target = e.target as HTMLElement;
                            // Check if clicked element is an SVG shape
                            if (['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line'].includes(target.tagName.toLowerCase())) {
                              const elemId = target.getAttribute('id');
                              if (elemId && !(currentFloorPlan.deletedSvgElements || []).includes(elemId)) {
                                e.stopPropagation();
                                setSelectedSvgElement(elemId);
                              }
                            }
                          }
                        }}
                      />
                      {/* Delete Button for Selected SVG Element */}
                      {selectedSvgElement && (
                        <div className="fixed top-24 right-8 z-50 glass rounded-lg p-3 border-2 border-purple-500 shadow-lg">
                          <p className="text-sm mb-2 font-medium">SVG Element Selected</p>
                          <button
                            onClick={() => {
                              deleteSvgElement(selectedBuilding, selectedLevel as number, selectedSvgElement);
                              setSelectedSvgElement(null);
                            }}
                            className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Element
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    // Static SVG image
                    <img
                      src={currentFloorPlan.fileData}
                      alt="Floor Plan"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p>PDF Floor Plan Background</p>
                      <p className="text-sm">(PDF preview not available in editor)</p>
                    </div>
                  </div>
                )}

                {/* SVG Layer for Polygons */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: '100%', height: '100%' }}
                >
                  {currentFloorPlan.overlays
                    .filter((overlay) => {
                      if (overlay.shape !== 'polygon') return false;
                      if (overlay.type === 'zone' && !layersVisible.zones) return false;
                      if (overlay.type === 'room' && !layersVisible.rooms) return false;
                      if (overlay.type === 'desk' && !layersVisible.desks) return false;
                      return true;
                    })
                    .map((overlay) => {
                      if (!overlay.points) return null;
                      const isSelected = selectedOverlay === overlay.id;
                      const centerX = overlay.x + overlay.width / 2;
                      const centerY = overlay.y + overlay.height / 2;
                      const pointsString = overlay.points
                        .map((p) => `${overlay.x + p.x},${overlay.y + p.y}`)
                        .join(' ');

                      return (
                        <g key={overlay.id} className="pointer-events-auto">
                          <polygon
                            points={pointsString}
                            className={`cursor-pointer ${
                              overlay.type === 'zone'
                                ? 'fill-purple-500/20 stroke-purple-500'
                                : overlay.type === 'room'
                                ? 'fill-blue-500/20 stroke-blue-500'
                                : 'fill-green-500/20 stroke-green-500'
                            }`}
                            strokeWidth="2"
                            onClick={(e: any) => {
                              e.stopPropagation();
                              handleOverlayClick(overlay.id, e);
                            }}
                            onMouseDown={(e: any) => {
                              e.stopPropagation();
                              handleOverlayDragStart(overlay.id, e);
                            }}
                          />
                          <text
                            x={centerX}
                            y={centerY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-medium fill-gray-900 dark:fill-white pointer-events-none"
                          >
                            {overlay.id}
                          </text>
                          {isSelected && (
                            <>
                              {/* Point handles for polygon */}
                              {overlay.points.map((p, idx) => (
                                <circle
                                  key={idx}
                                  cx={overlay.x + p.x}
                                  cy={overlay.y + p.y}
                                  r="4"
                                  className="fill-primary dark:fill-electric-cyan stroke-white cursor-move pointer-events-auto"
                                  strokeWidth="1"
                                />
                              ))}
                              {/* Delete button for polygon */}
                              <g transform={`translate(${overlay.x - 10}, ${overlay.y - 30})`} className="pointer-events-auto">
                                <circle cx="12" cy="12" r="10" fill="#ef4444" className="cursor-pointer" />
                                <path
                                  d="M8 8 L16 16 M16 8 L8 16"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  className="pointer-events-none"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="12"
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleDeleteOverlay(overlay.id);
                                  }}
                                />
                              </g>
                            </>
                          )}
                        </g>
                      );
                    })}
                </svg>

                {/* Rectangle Overlays */}
                {currentFloorPlan.overlays
                  .filter((overlay) => {
                    if (overlay.shape === 'polygon') return false; // Rendered in SVG layer
                    // Filter by layer visibility
                    if (overlay.type === 'zone' && !layersVisible.zones) return false;
                    if (overlay.type === 'room' && !layersVisible.rooms) return false;
                    if (overlay.type === 'desk' && !layersVisible.desks) return false;
                    return true;
                  })
                  .map((overlay) => {
                    const isSelected = selectedOverlay === overlay.id;

                    // Render rectangle
                    return (
                      <div
                        key={overlay.id}
                        onClick={(e) => handleOverlayClick(overlay.id, e)}
                        onMouseDown={(e) => {
                          // Only start dragging if not clicking on a handle
                          if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
                          if ((e.target as HTMLElement).classList.contains('rotate-handle')) return;
                          handleOverlayDragStart(overlay.id, e);
                        }}
                        className={`absolute ${
                          isSelected ? 'ring-2 ring-primary dark:ring-electric-cyan' : ''
                        }`}
                        style={{
                          left: `${overlay.x}px`,
                          top: `${overlay.y}px`,
                          width: `${overlay.width}px`,
                          height: `${overlay.height}px`,
                          cursor: isSelected && !isResizing && !isRotating ? 'move' : 'pointer',
                          transform: viewMode === '3d' && overlay.type === 'desk'
                            ? `rotate(${overlay.rotation}deg) translateZ(50px)`
                            : `rotate(${overlay.rotation}deg)`,
                          transformOrigin: 'center',
                          transformStyle: viewMode === '3d' ? 'preserve-3d' : undefined,
                          boxShadow: viewMode === '3d' && overlay.type === 'desk'
                            ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                            : undefined,
                        }}
                      >
                        {/* Rectangle Box */}
                        <div
                          className={`w-full h-full rounded border-2 flex items-center justify-center font-medium ${
                            overlay.type === 'zone'
                              ? 'bg-purple-500/20 border-purple-500'
                              : overlay.type === 'room'
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-green-500/20 border-green-500'
                          }`}
                        >
                          <span
                            className="text-gray-900 dark:text-white px-1 text-center break-words"
                            style={{
                              fontSize: `${Math.max(8, Math.min(12, overlay.width / 6))}px`,
                              lineHeight: '1.2'
                            }}
                          >
                            {overlay.id}
                          </span>
                        </div>

                        {/* Controls */}
                        {isSelected && (
                          <>
                            {/* Resize Handles */}
                            {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((handle) => (
                              <div
                                key={handle}
                                onMouseDown={(e) => handleResizeStart(overlay.id, handle, e)}
                                className={`resize-handle absolute w-3 h-3 bg-primary dark:bg-electric-cyan border border-white rounded-full cursor-${handle}-resize`}
                                style={{
                                  ...(handle.includes('n') && { top: '-6px' }),
                                  ...(handle.includes('s') && { bottom: '-6px' }),
                                  ...(handle.includes('w') && { left: '-6px' }),
                                  ...(handle.includes('e') && { right: '-6px' }),
                                  ...(handle === 'n' && { left: '50%', transform: 'translateX(-50%)' }),
                                  ...(handle === 's' && { left: '50%', transform: 'translateX(-50%)' }),
                                  ...(handle === 'w' && { top: '50%', transform: 'translateY(-50%)' }),
                                  ...(handle === 'e' && { top: '50%', transform: 'translateY(-50%)' }),
                                }}
                              />
                            ))}

                            {/* Rotation Handle */}
                            <div
                              onMouseDown={(e) => handleRotationStart(overlay.id, e)}
                              className="rotate-handle absolute w-6 h-6 bg-blue-500 border-2 border-white rounded-full cursor-grab flex items-center justify-center"
                              style={{
                                top: '-30px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                              }}
                              title="Rotate"
                            >
                              <RotateCw className="w-3 h-3 text-white" />
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute -top-8 -left-2 flex gap-1">
                              {/* Convert to Polygon */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  convertToPolygon(overlay.id);
                                }}
                                className="p-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                                title="Convert to Polygon"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOverlay(overlay.id);
                                }}
                                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                {/* Design Elements */}
                {editorMode === 'design' && currentFloorPlan.designElements && currentFloorPlan.designElements.map((element) => {
                  const isSelected = selectedDesignElement === element.id;

                  if (element.type === 'text') {
                    return (
                      <div
                        key={element.id}
                        onClick={(e) => handleDesignElementClick(element.id, e)}
                        onMouseMove={(e) => {
                          if (e.buttons === 1) handleDesignElementDrag(element.id, e);
                        }}
                        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                        style={{
                          left: `${element.x}px`,
                          top: `${element.y}px`,
                          transform: `rotate(${element.rotation}deg)`,
                          transformOrigin: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: `${element.fontSize || 16}px`,
                            fontWeight: element.fontWeight || 'normal',
                            color: element.color || '#000',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {element.text}
                        </span>
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDesignElement(selectedBuilding, selectedLevel as number, element.id);
                              setSelectedDesignElement(null);
                            }}
                            className="absolute -top-6 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  }

                  // 3D Objects (desks and tables)
                  if (element.type === '3d-desk' || element.type === '3d-meeting-table') {
                    return (
                      <div
                        key={element.id}
                        onClick={(e) => handleDesignElementClick(element.id, e)}
                        onMouseMove={(e) => {
                          if (e.buttons === 1) handleDesignElementDrag(element.id, e);
                        }}
                        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-green-500 rounded-lg' : ''}`}
                        style={{
                          left: `${element.x}px`,
                          top: `${element.y}px`,
                          width: `${element.width || 120}px`,
                          height: `${element.height || 60}px`,
                          transform: viewMode === '3d'
                            ? `rotate(${element.rotation}deg) translateZ(60px)`
                            : `rotate(${element.rotation}deg)`,
                          transformOrigin: 'center',
                          transformStyle: viewMode === '3d' ? 'preserve-3d' : undefined,
                        }}
                      >
                        {/* 3D Object Box */}
                        <div
                          className="w-full h-full rounded border-4 flex items-center justify-center font-medium relative"
                          style={{
                            backgroundColor: element.color || '#8B4513',
                            borderColor: '#654321',
                            boxShadow: viewMode === '3d'
                              ? '0 8px 16px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                              : '0 2px 4px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          <div className="text-center">
                            <div className="text-white font-bold text-sm mb-1">
                              {element.type === '3d-desk' ? '🖥️ Desk' : '🪑 Meeting Table'}
                            </div>
                            {element.deskId && (
                              <div className="text-xs bg-white/90 text-gray-900 px-2 py-1 rounded font-semibold">
                                {element.deskId}
                              </div>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <>
                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDesignElement(selectedBuilding, selectedLevel as number, element.id);
                                setSelectedDesignElement(null);
                              }}
                              className="absolute -top-8 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  }

                  // Icon element
                  const isFurniture = ['desk-icon', 'chair-icon', 'table-icon'].includes(element.type);
                  return (
                    <div
                      key={element.id}
                      onClick={(e) => handleDesignElementClick(element.id, e)}
                      onMouseMove={(e) => {
                        if (e.buttons === 1 && !isResizingDesignElement) handleDesignElementDrag(element.id, e);
                      }}
                      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-purple-500 rounded-lg p-1' : ''}`}
                      style={{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        transform: viewMode === '3d' && isFurniture
                          ? `rotate(${element.rotation}deg) translateZ(40px)`
                          : `rotate(${element.rotation}deg)`,
                        transformOrigin: 'center',
                        transformStyle: viewMode === '3d' ? 'preserve-3d' : undefined,
                        filter: viewMode === '3d' && isFurniture
                          ? 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))'
                          : undefined,
                      }}
                    >
                      <div style={{ color: element.color || '#333' }}>
                        {renderIcon(element.type, element.size || 24, element.color || '#333')}
                      </div>
                      {isSelected && (
                        <>
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDesignElement(selectedBuilding, selectedLevel as number, element.id);
                              setSelectedDesignElement(null);
                            }}
                            className="absolute -top-6 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {/* Resize handle */}
                          <div
                            onMouseDown={(e) => handleDesignElementResizeStart(element.id, e)}
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500 rounded-full cursor-ns-resize hover:bg-purple-600"
                            title="Drag to resize"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                {editorMode === 'data'
                  ? 'Drag items from the sidebar to place them on the map. Click to select, drag to move, drag corners to resize, drag rotation handle to rotate. Click "Convert to Polygon" to add/move corner points for irregular shapes.'
                  : 'Click a tool in the sidebar, then click on the map to place it. Click elements to select and drag to move. Click the X button to delete.'}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="glass rounded-xl p-4 sticky top-6">
              {editorMode === 'design' ? (
                /* Design Mode Sidebar */
                <>
                  <h3 className="text-lg font-bold mb-4 gradient-text">Design Tools</h3>

                  {/* Text Tool */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Text</h4>
                    <button
                      onClick={() => {
                        setSelectedDesignTool('text');
                        setIsEditingText(true);
                      }}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        selectedDesignTool === 'text'
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                          : 'bg-white dark:bg-dark-800 border-gray-300 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <Type className="w-5 h-5" />
                      <span>Add Text Label</span>
                    </button>
                  </div>

                  {/* 3D Objects - Only show in 3D view */}
                  {viewMode === '3d' && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">3D Furniture</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Add 3D objects that can be assigned desk IDs in Data Mode</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { type: '3d-desk' as DesignElementType, label: '3D Desk', icon: <Square className="w-5 h-5" /> },
                          { type: '3d-meeting-table' as DesignElementType, label: 'Meeting Table', icon: <Table className="w-5 h-5" /> },
                        ].map((tool) => (
                          <button
                            key={tool.type}
                            onClick={() => setSelectedDesignTool(tool.type)}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                              selectedDesignTool === tool.type
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-gray-900 dark:text-gray-100'
                                : 'bg-white dark:bg-dark-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-green-300'
                            }`}
                          >
                            {tool.icon}
                            <span className="text-xs">{tool.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Icon Library */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">2D Icons</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'desk-icon' as DesignElementType, label: 'Desk', icon: <Square className="w-5 h-5" /> },
                        { type: 'chair-icon' as DesignElementType, label: 'Chair', icon: <Armchair className="w-5 h-5" /> },
                        { type: 'toilet-icon' as DesignElementType, label: 'Toilet', icon: <DoorOpen className="w-5 h-5" /> },
                        { type: 'stairs-icon' as DesignElementType, label: 'Stairs', icon: <Building2 className="w-5 h-5" /> },
                        { type: 'exit-icon' as DesignElementType, label: 'Exit', icon: <DoorOpen className="w-5 h-5" /> },
                        { type: 'elevator-icon' as DesignElementType, label: 'Elevator', icon: <Building2 className="w-5 h-5" /> },
                        { type: 'plant-icon' as DesignElementType, label: 'Plant', icon: <TreePine className="w-5 h-5" /> },
                        { type: 'table-icon' as DesignElementType, label: 'Table', icon: <Table className="w-5 h-5" /> },
                      ].map((tool) => (
                        <button
                          key={tool.type}
                          onClick={() => setSelectedDesignTool(tool.type)}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                            selectedDesignTool === tool.type
                              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-gray-900 dark:text-gray-100'
                              : 'bg-white dark:bg-dark-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-purple-300'
                          }`}
                        >
                          {tool.icon}
                          <span className="text-xs">{tool.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Element Properties */}
                  {selectedDesignElement && currentFloorPlan && currentFloorPlan.designElements && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Element Properties</h4>
                      {(() => {
                        const element = currentFloorPlan.designElements.find((e) => e.id === selectedDesignElement);
                        if (!element) return null;

                        const is3DObject = element.type === '3d-desk' || element.type === '3d-meeting-table';

                        return (
                          <div className={`p-3 rounded-lg border space-y-3 ${
                            is3DObject
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                          }`}>
                            {/* Desk ID for 3D Objects */}
                            {is3DObject && (
                              <div>
                                <label className="text-xs font-medium text-green-700 dark:text-green-300 block mb-1">
                                  Assign Desk ID
                                </label>
                                <input
                                  type="text"
                                  value={element.deskId || ''}
                                  onChange={(e) => handleDeskIdChange(element.id, e.target.value)}
                                  placeholder="e.g., Desk-1.01"
                                  className="w-full px-2 py-1.5 text-sm rounded border border-green-300 dark:border-green-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Link this 3D object to desk data for availability tracking
                                </p>
                              </div>
                            )}

                            <div>
                              <label className={`text-xs font-medium block mb-1 ${
                                is3DObject ? 'text-green-700 dark:text-green-300' : 'text-purple-700 dark:text-purple-300'
                              }`}>
                                Color
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={element.color || '#333333'}
                                  onChange={(e) => handleDesignElementColorChange(element.id, e.target.value)}
                                  className="w-12 h-8 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={element.color || '#333333'}
                                  onChange={(e) => handleDesignElementColorChange(element.id, e.target.value)}
                                  className={`flex-1 px-2 py-1 text-xs rounded border bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 ${
                                    is3DObject ? 'border-green-300 dark:border-green-600' : 'border-purple-300 dark:border-purple-600'
                                  }`}
                                />
                              </div>
                            </div>
                            {element.type !== 'text' && !is3DObject && (
                              <div>
                                <label className="text-xs font-medium text-purple-700 dark:text-purple-300 block mb-1">
                                  Size: {element.size || 24}px
                                </label>
                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                  Drag the resize handle to adjust
                                </p>
                              </div>
                            )}
                            {is3DObject && (
                              <div>
                                <label className="text-xs font-medium text-green-700 dark:text-green-300 block mb-1">
                                  Dimensions
                                </label>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  {element.width || 120} × {element.height || 60} px
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* SVG Editing Section */}
                  {currentFloorPlan && currentFloorPlan.fileType === 'svg' && currentFloorPlan.svgContent && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">SVG Editing</h4>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                          <strong>Click SVG elements</strong> on the floor plan to select and delete them.
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {(currentFloorPlan.deletedSvgElements || []).length > 0
                            ? `${(currentFloorPlan.deletedSvgElements || []).length} element(s) deleted`
                            : 'No elements deleted yet'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      {selectedDesignTool
                        ? 'Click on the map to place the selected tool'
                        : 'Select a tool above, or click SVG elements to edit the floor plan'}
                    </p>
                  </div>
                </>
              ) : (
                /* Data Mode Sidebar */
                <>
                  {/* Tabs */}
                  <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSidebarTab('zones')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    sidebarTab === 'zones'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  Zones
                </button>
                <button
                  onClick={() => setSidebarTab('rooms')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    sidebarTab === 'rooms'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  Rooms
                </button>
                <button
                  onClick={() => setSidebarTab('desks')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    sidebarTab === 'desks'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  Desks
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sidebarTab === 'zones' &&
                  filteredZones.map((zone) => {
                    const isPlaced = currentFloorPlan.overlays.some((o) => o.id === zone.zoneName);
                    return (
                      <div
                        key={zone.zoneName}
                        draggable={!isPlaced}
                        onDragStart={() => handleDragStart(zone.zoneName, 'zone')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isPlaced
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 opacity-50 cursor-not-allowed'
                            : 'bg-white dark:bg-dark-800 border-purple-300 dark:border-purple-600 cursor-grab hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Square className="w-4 h-4 text-purple-600" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{zone.zoneName}</div>
                            <div className="text-xs text-gray-500">Capacity: {zone.zoneCapacity}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {sidebarTab === 'rooms' &&
                  filteredRooms.map((room) => {
                    const isPlaced = currentFloorPlan.overlays.some((o) => o.id === room.roomId);
                    return (
                      <div
                        key={room.roomId}
                        draggable={!isPlaced}
                        onDragStart={() => handleDragStart(room.roomId, 'room')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isPlaced
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 opacity-50 cursor-not-allowed'
                            : 'bg-white dark:bg-dark-800 border-blue-300 dark:border-blue-600 cursor-grab hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{room.roomId}</div>
                            <div className="text-xs text-gray-500">{room.roomName}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {sidebarTab === 'desks' &&
                  filteredDesks.map((desk) => {
                    const isPlaced = currentFloorPlan.overlays.some((o) => o.id === desk.deskId);
                    return (
                      <div
                        key={desk.deskId}
                        draggable={!isPlaced}
                        onDragStart={() => handleDragStart(desk.deskId, 'desk')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isPlaced
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 opacity-50 cursor-not-allowed'
                            : 'bg-white dark:bg-dark-800 border-green-300 dark:border-green-600 cursor-grab hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Square className="w-4 h-4 text-green-600" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{desk.deskId}</div>
                            <div className="text-xs text-gray-500">{desk.name}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Empty State */}
                {sidebarTab === 'zones' && filteredZones.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No zones for this floor</p>
                    <p className="text-sm">Add zones in the Zones tab</p>
                  </div>
                )}
                {sidebarTab === 'rooms' && filteredRooms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No rooms for this floor</p>
                    <p className="text-sm">Add rooms in the Rooms tab</p>
                  </div>
                )}
                {sidebarTab === 'desks' && filteredDesks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No desks for this floor</p>
                    <p className="text-sm">Add desks in the Desks tab</p>
                  </div>
                )}
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Text Input Modal */}
      {isEditingText && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsEditingText(false)}>
          <div className="glass rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add Text Label</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddText();
                if (e.key === 'Escape') setIsEditingText(false);
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditingText(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddText}
                disabled={!textInput.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!selectedBuilding || selectedLevel === '' ? (
        <div className="glass rounded-xl p-8 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-bold mb-2">Get Started</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select a building and level to upload a floor plan and start mapping your spaces.
          </p>
          <div className="text-left max-w-2xl mx-auto space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>1.</strong> Choose your building and level from the dropdowns above
            </p>
            <p>
              <strong>2.</strong> Upload a floor plan (SVG or PDF format)
            </p>
            <p>
              <strong>3.</strong> Drag zones, rooms, and desks from the sidebar onto the map
            </p>
            <p>
              <strong>4.</strong> Resize and position each overlay to match your floor plan
            </p>
            <p>
              <strong>5.</strong> Export the final interactive SVG for use in your application
            </p>
          </div>
        </div>
      ) : !currentFloorPlan ? (
        <div className="glass rounded-xl p-8 text-center">
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-bold mb-2">Upload Floor Plan</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a floor plan for <strong>{selectedBuilding}</strong> - Level <strong>{selectedLevel}</strong> to
            begin mapping.
          </p>
        </div>
      ) : null}
    </div>
  );
};
