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
      name: "",
      number: "",
      rent: "",
      availability: "",
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

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Canvas size setup
  useEffect(() => {
    console.log("Initializing canvas size");
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

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [isMobile]);

  // Video rendering
  useEffect(() => {
    console.log("Setting up media rendering");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;
    const image = imageRef.current;

    const render = () => {
      if (
        mediaType === "video" &&
        video.readyState >= video.HAVE_CURRENT_DATA
      ) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawAreas(ctx);
        drawCurrentArea(ctx);
        requestAnimationFrame(render);
      } else if (mediaType === "image" && image.complete) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        drawAreas(ctx);
        drawCurrentArea(ctx);
      }
    };

    if (mediaType === "video") {
      video.play();
    }
    render();

    return () => {
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

      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fill();
      ctx.strokeStyle = "green";
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
        return distance < 10; // 10px radius for hover detection
      });
    };

    // Check current points being plotted
    const hoveredPointIndex = checkPointProximity(currentPoints);
    setHoveredPoint(hoveredPointIndex);
    setIsPointHovered(hoveredPointIndex === 0 && currentPoints.length > 2);

    // Check completed areas
    const hoveredAreaIndex = areas.findIndex((area) => {
      const pointIndex = checkPointProximity(area.points);
      return pointIndex !== -1;
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

    // If hovering over first point and we have enough points, complete the area
    if (isPointHovered && currentPoints.length > 2) {
      handleCompleteArea();
      return;
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
    setCurrentArea({
      ...currentArea,
      points: currentPoints,
      videoTimestamp: videoRef.current.currentTime,
    });
    setShowForm(true);
  };

  const handleSaveArea = (e) => {
    e.preventDefault();
    console.log("Saving area:", currentArea);

    setAreas((prev) => [...prev, currentArea]);
    setCurrentPoints([]);
    setCurrentArea({
      points: [],
      details: {
        name: "",
        number: "",
        rent: "",
        availability: "",
      },
      videoTimestamp: 0,
    });
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
    const areasString = JSON.stringify(areas, null, 2);
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

    const fileType = file.type.split("/")[0];
    const url = URL.createObjectURL(file);

    console.log("File selected:", { type: fileType, url });

    if (fileType === "video") {
      setMediaType("video");
      setMediaUrl(url);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    } else if (fileType === "image") {
      setMediaType("image");
      setMediaUrl(url);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current.src = url;
        }
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
        />
        <img
          ref={imageRef}
          src={mediaType === "image" ? mediaUrl : ""}
          alt="Plot area"
          style={{ display: "none" }}
        />

        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
          {mediaType ? `Current media type: ${mediaType}` : "No media selected"}
        </div>

        {/* Hover tooltip for completed areas */}
        {hoveredArea && (
          <div
            className="fixed bg-white p-3 rounded shadow-lg z-50"
            style={{
              left: popupPosition.x + "px",
              top: popupPosition.y + "px",
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            <p>
              <strong>Name:</strong> {hoveredArea.details.name || "N/A"}
            </p>
            <p>
              <strong>Number:</strong> {hoveredArea.details.number || "N/A"}
            </p>
            <p>
              <strong>Rent:</strong> {hoveredArea.details.rent || "N/A"}
            </p>
            <p>
              <strong>Availability:</strong>{" "}
              {hoveredArea.details.availability || "N/A"}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Area Details</h2>
            <form onSubmit={handleSaveArea} className="space-y-4">
              <div>
                <label className="block mb-1">Name:</label>
                <input
                  type="text"
                  value={currentArea.details.name}
                  onChange={(e) =>
                    setCurrentArea({
                      ...currentArea,
                      details: { ...currentArea.details, name: e.target.value },
                    })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Number:</label>
                <input
                  type="text"
                  value={currentArea.details.number}
                  onChange={(e) =>
                    setCurrentArea({
                      ...currentArea,
                      details: {
                        ...currentArea.details,
                        number: e.target.value,
                      },
                    })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Rent:</label>
                <input
                  type="text"
                  value={currentArea.details.rent}
                  onChange={(e) =>
                    setCurrentArea({
                      ...currentArea,
                      details: { ...currentArea.details, rent: e.target.value },
                    })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Availability:</label>
                <input
                  type="text"
                  value={currentArea.details.availability}
                  onChange={(e) =>
                    setCurrentArea({
                      ...currentArea,
                      details: {
                        ...currentArea.details,
                        availability: e.target.value,
                      },
                    })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlot;
