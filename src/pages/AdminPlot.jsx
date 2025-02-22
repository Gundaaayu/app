import React, { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import landVideo from "/src/assets/land.mp4";

const MIN_VIDEO_WIDTH = 1920;
const MIN_VIDEO_HEIGHT = 1080;

const AdminPlot = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [currentPoints, setCurrentPoints] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentArea, setCurrentArea] = useState({
    points: [],
    details: {
      plotNo: "",
      amount: "",
      totalSqft: "",
      cents: "",
      heightFt: "",
      widthFt: "",
      availability: "available",
    },
    videoTimestamp: 0,
  });

  // Add new state for hover details
  const [hoveredArea, setHoveredArea] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isPointHovered, setIsPointHovered] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const [mediaType, setMediaType] = useState(null); // 'video' or 'image'
  const [mediaUrl, setMediaUrl] = useState(landVideo); // default video

  // Add undo history state
  const [pointsHistory, setPointsHistory] = useState([]);

  // Add new state for loading
  const [isLoading, setIsLoading] = useState(false);

  // Add new state for availability
  const [currentAvailability, setCurrentAvailability] = useState("available");

  // Add new state for edit mode
  const [editingArea, setEditingArea] = useState(null);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Add random data generator function
  const generateRandomPlotData = () => {
    const plotNumbers = ["A", "B", "C", "D", "E", "F"];
    const randomPlotNo = `Plot ${
      plotNumbers[Math.floor(Math.random() * plotNumbers.length)]
    }${Math.floor(Math.random() * 100)}`;
    const randomAmount = `${Math.floor(Math.random() * 900000) + 100000}`; // Random amount between 100,000 and 1,000,000
    const randomSqft = `${Math.floor(Math.random() * 2000) + 500}`; // Random sqft between 500 and 2500
    const randomCents = `${(Math.random() * 10).toFixed(2)}`; // Random cents between 0 and 10
    const randomHeight = `${Math.floor(Math.random() * 50) + 20}`; // Random height between 20 and 70 ft
    const randomWidth = `${Math.floor(Math.random() * 40) + 15}`; // Random width between 15 and 55 ft
    const randomAvailability =
      Math.random() > 0.3 ? "available" : "unavailable"; // 70% chance of being available

    return {
      plotNo: randomPlotNo,
      amount: randomAmount,
      totalSqft: randomSqft,
      cents: randomCents,
      heightFt: randomHeight,
      widthFt: randomWidth,
      availability: randomAvailability,
    };
  };

  // Canvas size setup
  const updateCanvasSize = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

    const scale =
      Math.max(
        MIN_VIDEO_WIDTH / containerWidth,
        MIN_VIDEO_HEIGHT / containerHeight
      ) * 1.2;

    const targetWidth = containerWidth * scale;
    const targetHeight = (targetWidth * 9) / 16;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    setImgSize({ width: targetWidth, height: targetHeight });
    console.log("Canvas size updated:", {
      width: targetWidth,
      height: targetHeight,
    });
  };

  // Video rendering
  useEffect(() => {
    console.log("Setting up media rendering");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;
    const image = imageRef.current;

    let animationFrame;

    const render = () => {
      if (
        mediaType === "video" &&
        video.readyState >= video.HAVE_CURRENT_DATA
      ) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawAreas(ctx);
        drawCurrentArea(ctx);
        animationFrame = requestAnimationFrame(render);
      } else if (mediaType === "image" && image.complete) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        drawAreas(ctx);
        drawCurrentArea(ctx);
      }
    };

    if (mediaType === "video") {
      video.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
    render();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (mediaType === "video") {
        video.pause();
      }
    };
  }, [imgSize, areas, currentPoints, mediaType]);

  const drawAreas = (ctx) => {
    areas.forEach((area, index) => {
      const scaledPoints = area.points.map((p) => ({
        x: p.x * imgSize.width,
        y: p.y * imgSize.height,
      }));

      // Draw the area polygon
      ctx.beginPath();
      ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
      scaledPoints.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();

      // Set fill color based on availability
      ctx.fillStyle =
        area.details.availability === "available"
          ? "rgba(0, 255, 0, 0.3)"
          : "rgba(255, 0, 0, 0.3)";
      ctx.fill();
      ctx.strokeStyle =
        area.details.availability === "available" ? "green" : "red";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw points as dots
      scaledPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = "green";
        ctx.stroke();
      });

      // Draw area number
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(
        `Area ${index + 1}`,
        scaledPoints[0].x,
        scaledPoints[0].y - 10
      );
    });
  };

  const drawCurrentArea = (ctx) => {
    if (currentPoints.length > 0) {
      const scaledPoints = currentPoints.map((p) => ({
        x: p.x * imgSize.width,
        y: p.y * imgSize.height,
      }));

      // Draw lines between points
      ctx.beginPath();
      ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
      scaledPoints.forEach((point) => ctx.lineTo(point.x, point.y));

      // Close the shape if mouse is near the first point
      if (isPointHovered && hoveredPoint === 0 && currentPoints.length > 2) {
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
        ctx.fill();
      }

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw points as dots
      scaledPoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = index === hoveredPoint ? "yellow" : "white";
        ctx.fill();
        ctx.strokeStyle = "red";
        ctx.stroke();
      });
    }
  };

  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvas.width;
    const y = (event.clientY - rect.top) / canvas.height;

    // Check if mouse is near any point
    const checkPointProximity = (points) => {
      return points.findIndex((p) => {
        const scaledX = p.x * imgSize.width;
        const scaledY = p.y * imgSize.height;
        const distance = Math.sqrt(
          Math.pow(x * canvas.width - scaledX, 2) +
            Math.pow(y * canvas.height - scaledY, 2)
        );
        return distance < 10;
      });
    };

    // Check current points being plotted
    const hoveredPointIndex = checkPointProximity(currentPoints);
    setHoveredPoint(hoveredPointIndex);
    setIsPointHovered(hoveredPointIndex === 0 && currentPoints.length > 2);

    // Check if mouse is inside any area
    const hoveredAreaIndex = areas.findIndex((area) => {
      return isPointInPolygon({ x, y }, area.points);
    });

    if (hoveredAreaIndex !== -1) {
      setHoveredArea(areas[hoveredAreaIndex]);
      setPopupPosition({ x: event.clientX, y: event.clientY - 100 });
    } else {
      setHoveredArea(null);
    }
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvas.width;
    const y = (event.clientY - rect.top) / canvas.height;

    console.log("Canvas clicked:", { x, y });

    // Check if clicking inside an existing area
    const clickedAreaIndex = areas.findIndex((area) =>
      isPointInPolygon({ x, y }, area.points)
    );

    if (clickedAreaIndex !== -1) {
      // Open edit dialog for clicked area
      const areaToEdit = areas[clickedAreaIndex];
      setEditingArea(areaToEdit);
      setCurrentArea(areaToEdit); // Set the current area to the one being edited
      setShowForm(true);
      return;
    }

    // If hovering over first point and we have enough points, complete the area
    if (isPointHovered && currentPoints.length > 2) {
      // Check if new area overlaps with existing areas
      if (checkForOverlap([...currentPoints, currentPoints[0]])) {
        alert("Areas cannot overlap. Please choose a different location.");
        return;
      }
      handleCompleteArea();
      return;
    }

    // Check if new point would create overlap
    if (currentPoints.length > 0) {
      const newPoints = [...currentPoints, { x, y }];
      if (checkForOverlap(newPoints)) {
        alert("Areas cannot overlap. Please choose a different location.");
        return;
      }
    }

    setCurrentPoints((prev) => [...prev, { x, y }]);
  };

  const handleCompleteArea = () => {
    if (currentPoints.length < 3) {
      console.log("Not enough points to form an area");
      alert("Please add at least 3 points to create an area");
      return;
    }

    console.log("Completing area with points:", currentPoints);
    const randomDetails = generateRandomPlotData();
    setCurrentArea({
      ...currentArea,
      points: currentPoints,
      details: randomDetails,
      videoTimestamp: videoRef.current?.currentTime || 0,
    });
    setShowForm(true);
  };

  const handleSaveArea = (e) => {
    e.preventDefault();
    console.log("Saving area:", editingArea ? "edit mode" : "new mode");

    if (editingArea) {
      setAreas((prev) =>
        prev.map((area) => (area === editingArea ? { ...currentArea } : area))
      );
    } else {
      setAreas((prev) => [...prev, currentArea]);
    }

    setCurrentPoints([]);
    setCurrentArea({
      points: [],
      details: {
        plotNo: "",
        amount: "",
        totalSqft: "",
        cents: "",
        heightFt: "",
        widthFt: "",
        availability: "available",
      },
      videoTimestamp: 0,
    });
    setEditingArea(null);
    setShowForm(false);
  };

  const handleExport = () => {
    console.log("Exporting areas:", areas);
    const dataStr = JSON.stringify(areas, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.download = "plotted-areas.json";
    link.href = url;
    link.click();
  };

  const handleReset = () => {
    console.log("Resetting current area");
    setCurrentPoints([]);
    setShowForm(false);
  };

  const handleCopyAreas = () => {
    const exportData = {
      mediaType: mediaType || "video", // default to video if not set
      areas: areas,
    };

    const areasString = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(areasString).then(
      () => {
        console.log("Areas copied to clipboard");
        alert("Areas data copied to clipboard!");
      },
      (err) => {
        console.error("Failed to copy areas:", err);
        alert("Failed to copy areas data");
      }
    );
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const fileType = file.type.split("/")[0];
    const url = URL.createObjectURL(file);

    console.log("File selected:", { type: fileType, url });

    if (fileType === "video") {
      setMediaType("video");
      setMediaUrl(url);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.onloadeddata = () => {
          console.log("Video loaded");
          updateCanvasSize();
          setIsLoading(false);
        };
        videoRef.current.onerror = () => {
          console.error("Error loading video");
          setIsLoading(false);
          alert("Error loading video");
        };
      }
    } else if (fileType === "image") {
      setMediaType("image");
      const img = new Image();
      img.src = url;
      img.onload = () => {
        console.log("Image loaded");
        setMediaUrl(url);
        if (imageRef.current) {
          imageRef.current.src = url;
          updateCanvasSize();
        }
        setIsLoading(false);
      };
      img.onerror = () => {
        console.error("Error loading image");
        setIsLoading(false);
        alert("Error loading image");
      };
    }
  };

  const handleUndo = () => {
    if (currentPoints.length > 0) {
      // Save current points to history before undoing
      setPointsHistory((prev) => [...prev, [...currentPoints]]);
      setCurrentPoints((prev) => prev.slice(0, -1));
      console.log("Undoing last point");
    }
  };

  // Add a new useEffect to handle media type changes
  useEffect(() => {
    if (mediaType) {
      updateCanvasSize();
    }
  }, [mediaType]);

  // Add function to check for overlapping areas
  const checkForOverlap = (newPoints) => {
    if (newPoints.length < 3) return false;

    // Create edges for the new polygon
    const newEdges = newPoints.map((point, i) => ({
      start: point,
      end: newPoints[(i + 1) % newPoints.length],
    }));

    // Check against each existing area
    return areas.some((area) => {
      const areaEdges = area.points.map((point, i) => ({
        start: point,
        end: area.points[(i + 1) % area.points.length],
      }));

      // Check if any edges intersect
      return newEdges.some((edge1) =>
        areaEdges.some((edge2) =>
          doLinesIntersect(edge1.start, edge1.end, edge2.start, edge2.end)
        )
      );
    });
  };

  // Add helper function to check if lines intersect
  const doLinesIntersect = (p1, p2, p3, p4) => {
    const denominator =
      (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denominator === 0) return false;

    const ua =
      ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
      denominator;
    const ub =
      ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
      denominator;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  };

  // Add function to handle area deletion
  const handleDeleteArea = () => {
    if (!editingArea) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this area?"
    );
    if (confirmDelete) {
      setAreas((prev) => prev.filter((area) => area !== editingArea));
      setEditingArea(null);
      setShowForm(false);
    }
  };

  // Add this function near your other helper functions
  const isPointInPolygon = (point, vertices) => {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x,
        yi = vertices[i].y;
      const xj = vertices[j].x,
        yj = vertices[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Plot Editor</h1>
        <div className="space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Browse Media
          </button>
          <button
            onClick={handleUndo}
            disabled={currentPoints.length === 0}
            className={`px-4 py-2 rounded ${
              currentPoints.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white`}
          >
            Undo
          </button>
          <button
            onClick={handleReset}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
          <button
            onClick={handleCopyAreas}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Copy Areas
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[calc(100vh-100px)] overflow-auto border-2 border-gray-300 rounded"
      >
        {/* Add loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
              <p>Loading media...</p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="absolute top-0 left-0 cursor-crosshair"
        />
        <video
          ref={videoRef}
          src={mediaType === "video" ? mediaUrl : ""}
          loop
          muted
          playsInline
          style={{ display: "none" }}
          onLoadedData={() => {
            console.log("Video element loaded data");
          }}
          onError={(e) => {
            console.error("Video error:", e);
          }}
        />
        <img
          ref={imageRef}
          src={mediaType === "image" ? mediaUrl : ""}
          alt="Plot area"
          style={{ display: "none" }}
          onLoad={() => {
            console.log("Image element loaded");
          }}
          onError={(e) => {
            console.error("Image error:", e);
          }}
        />

        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
          {mediaType ? `Current media type: ${mediaType}` : "No media selected"}
        </div>

        {/* Hover tooltip for completed areas */}
        {hoveredArea && (
          <div
            className="fixed bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-50 border border-gray-200"
            style={{
              left: popupPosition.x + "px",
              top: popupPosition.y + "px",
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            <h3 className="font-semibold mb-2">Plot Details</h3>
            <p>
              <strong>Plot No:</strong> {hoveredArea.details.plotNo || "N/A"}
            </p>
            <p>
              <strong>Amount:</strong> {hoveredArea.details.amount || "N/A"}
            </p>
            <p>
              <strong>Total Sqft:</strong>{" "}
              {hoveredArea.details.totalSqft || "N/A"}
            </p>
            <p>
              <strong>Cents:</strong> {hoveredArea.details.cents || "N/A"}
            </p>
            <p>
              <strong>Dimensions:</strong>{" "}
              {hoveredArea.details.widthFt || "N/A"} x{" "}
              {hoveredArea.details.heightFt || "N/A"} ft
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  hoveredArea.details.availability === "available"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {hoveredArea.details.availability === "available"
                  ? "Available"
                  : "Unavailable"}
              </span>
            </p>
          </div>
        )}

        {/* Instructions for user */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
          {currentPoints.length === 0 ? (
            <p>Click to start plotting points</p>
          ) : isPointHovered ? (
            <p>Click the first point to complete the area</p>
          ) : (
            <p>Continue clicking to add more points</p>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/30"
            onClick={() => {
              setShowForm(false);
              setEditingArea(null);
            }}
          />
          <div className="relative bg-white/90 p-8 rounded-xl shadow-2xl w-[500px] transform transition-all duration-300 ease-out scale-100 opacity-100 animate-modal-enter">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingArea ? "Edit Area" : "New Area"}
            </h2>
            <form onSubmit={handleSaveArea} className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-700">Plot No:</label>
                <input
                  type="text"
                  value={currentArea.details.plotNo}
                  onChange={(e) =>
                    setCurrentArea({
                      ...currentArea,
                      details: {
                        ...currentArea.details,
                        plotNo: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700">Amount:</label>
                  <input
                    type="text"
                    value={currentArea.details.amount}
                    onChange={(e) =>
                      setCurrentArea({
                        ...currentArea,
                        details: {
                          ...currentArea.details,
                          amount: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">
                    Total Sqft:
                  </label>
                  <input
                    type="text"
                    value={currentArea.details.totalSqft}
                    onChange={(e) =>
                      setCurrentArea({
                        ...currentArea,
                        details: {
                          ...currentArea.details,
                          totalSqft: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700">Cents:</label>
                  <input
                    type="text"
                    value={currentArea.details.cents}
                    onChange={(e) =>
                      setCurrentArea({
                        ...currentArea,
                        details: {
                          ...currentArea.details,
                          cents: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">
                    Height (ft):
                  </label>
                  <input
                    type="text"
                    value={currentArea.details.heightFt}
                    onChange={(e) =>
                      setCurrentArea({
                        ...currentArea,
                        details: {
                          ...currentArea.details,
                          heightFt: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">
                    Width (ft):
                  </label>
                  <input
                    type="text"
                    value={currentArea.details.widthFt}
                    onChange={(e) =>
                      setCurrentArea({
                        ...currentArea,
                        details: {
                          ...currentArea.details,
                          widthFt: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700">Availability:</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="available"
                      checked={currentArea.details.availability === "available"}
                      onChange={(e) =>
                        setCurrentArea({
                          ...currentArea,
                          details: {
                            ...currentArea.details,
                            availability: e.target.value,
                          },
                        })
                      }
                      className="form-radio text-green-500"
                    />
                    <span className="ml-2 text-gray-700">Available</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="unavailable"
                      checked={
                        currentArea.details.availability === "unavailable"
                      }
                      onChange={(e) =>
                        setCurrentArea({
                          ...currentArea,
                          details: {
                            ...currentArea.details,
                            availability: e.target.value,
                          },
                        })
                      }
                      className="form-radio text-red-500"
                    />
                    <span className="ml-2 text-gray-700">Unavailable</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between space-x-3 mt-6">
                {editingArea && (
                  <button
                    type="button"
                    onClick={handleDeleteArea}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Delete Area
                  </button>
                )}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingArea(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    {editingArea ? "Update" : "Save"} Area
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlot;
