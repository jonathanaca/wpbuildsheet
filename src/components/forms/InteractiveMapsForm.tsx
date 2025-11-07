import React, { useState, useRef } from 'react';
import { useBuildSheetStore } from '../../store/buildsheet.store';
import type { FloorPlan, MapOverlay } from '../../types/buildsheet.types';
import { Upload, Download, Trash2, MapPin, Square, Home, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, RotateCw, Edit3 } from 'lucide-react';

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

  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('desks');
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'zone' | 'room' | 'desk' } | null>(null);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [rotationStart, setRotationStart] = useState<{ angle: number; mouseAngle: number } | null>(null);

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

      if (currentFloorPlan) {
        // Keep existing overlays when updating floor plan
        newFloorPlan.overlays = currentFloorPlan.overlays;
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

  // Handle resize start
  const handleResizeStart = (overlayId: string, handle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedOverlay(overlayId);
    setIsResizing(true);
    setResizeHandle(handle);
  };

  // Handle mouse move for resizing and dragging
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
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
        {currentFloorPlan && (
          <button
            onClick={handleExportSVG}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Export SVG
          </button>
        )}
      </div>

      {/* Selection Controls */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Building Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">Building</label>
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
            <label className="block text-sm font-medium mb-2">Level (Floor)</label>
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
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Layers:</span>
                  <button
                    onClick={() => toggleLayerVisibility('zones')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                      layersVisible.zones
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-400 border border-gray-300 dark:border-gray-600'
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
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-400 border border-gray-300 dark:border-gray-600'
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
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-400 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {layersVisible.desks ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Desks
                  </button>
                </div>
              </div>

              <div
                ref={canvasRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={() => setSelectedOverlay(null)}
                className="relative w-full bg-white dark:bg-dark-900 rounded-lg overflow-auto"
                style={{
                  minHeight: '600px',
                  cursor: isResizing ? 'nwse-resize' : isDraggingOverlay ? 'grabbing' : isRotating ? 'grabbing' : 'default'
                }}
              >
                <div
                  className="relative origin-top-left"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: '100%',
                    minHeight: '600px',
                  }}
                >
                {/* Floor Plan Background */}
                {currentFloorPlan.fileType === 'svg' ? (
                  <img
                    src={currentFloorPlan.fileData}
                    alt="Floor Plan"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
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
                          transform: `rotate(${overlay.rotation}deg)`,
                          transformOrigin: 'center',
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
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Drag items from the sidebar to place them on the map. Click to select, drag to move, drag corners to resize, drag rotation handle to rotate. Click "Convert to Polygon" to add/move corner points for irregular shapes.
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="glass rounded-xl p-4 sticky top-6">
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
