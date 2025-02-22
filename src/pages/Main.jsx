import React, { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import land from "/src/assets/land.jpg";
import landVideo from "/src/assets/land.mp4";

const savedAreas = [
  {
    points: [
      {
        x: 0.2595486111111111,
        y: 0.37114197530864196,
      },
      {
        x: 0.3107638888888889,
        y: 0.3680555555555556,
      },
      {
        x: 0.3268229166666667,
        y: 0.5408950617283951,
      },
      {
        x: 0.2782118055555556,
        y: 0.5570987654320988,
      },
    ],
    details: {
      name: "New Data",
      number: "hey",
      rent: "3oo00",
      availability: "available",
    },
    videoTimestamp: 9.177381,
  },
  {
    points: [
      {
        x: 0.19140625,
        y: 0.3549382716049383,
      },
      {
        x: 0.24131944444444445,
        y: 0.35648148148148145,
      },
      {
        x: 0.2591145833333333,
        y: 0.566358024691358,
      },
      {
        x: 0.21223958333333334,
        y: 0.5794753086419753,
      },
    ],
    details: {
      name: "New",
      number: "2888",
      rent: "30000",
      availability: "unavailable",
    },
    videoTimestamp: 4.054185,
  },
  {
    points: [
      {
        x: 0.15364583333333334,
        y: 0.35725308641975306,
      },
      {
        x: 0.1579861111111111,
        y: 0.5138888888888888,
      },
      {
        x: 0.11979166666666667,
        y: 0.5262345679012346,
      },
      {
        x: 0.11805555555555555,
        y: 0.5154320987654321,
      },
      {
        x: 0.08897569444444445,
        y: 0.5216049382716049,
      },
      {
        x: 0.07335069444444445,
        y: 0.6141975308641975,
      },
      {
        x: 0.0881076388888889,
        y: 0.6165123456790124,
      },
      {
        x: 0.0915798611111111,
        y: 0.6466049382716049,
      },
      {
        x: 0.19835069444444445,
        y: 0.6157407407407407,
      },
      {
        x: 0.17664930555555555,
        y: 0.3533950617283951,
      },
    ],
    details: {
      name: "New Data",
      number: "30000",
      rent: "5000",
      availability: "available",
    },
    videoTimestamp: 11.227354,
  },
];



// Update these size constants at the top of the component
const MIN_VIDEO_WIDTH = 1920; // minimum width the video should have
const MIN_VIDEO_HEIGHT = 1080; // minimum height the video should have

const Main = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [hoveredArea, setHoveredArea] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cursorCoordinates, setCursorCoordinates] = useState({
    x: 0,
    y: 0,
    relativeX: 0,
    relativeY: 0,
  });
  const animationFrameRef = useRef();

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Update the canvas size setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = containerRef.current;

    const updateCanvasSize = () => {
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;

      // Always make the canvas larger than the viewport
      let scale =
        Math.max(
          MIN_VIDEO_WIDTH / containerWidth,
          MIN_VIDEO_HEIGHT / containerHeight
        ) * 1.2; // 20% larger than minimum required scale

      const targetWidth = containerWidth * scale;
      const targetHeight = (targetWidth * 9) / 16; // maintain 16:9 aspect ratio

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      setImgSize({ width: targetWidth, height: targetHeight });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [isMobile]);

  // Handle video rendering on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    const render = () => {
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawAreas(ctx);
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    video.play();
    render();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [imgSize]);

  const drawAreas = (ctx) => {
    savedAreas.forEach((area) => {
      const scaledPoints = area.points.map((p) => ({
        x: (p.x - 0.0001) * imgSize.width,
        y: (p.y - 0.001) * imgSize.height,
      }));

      ctx.beginPath();
      ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
      scaledPoints.forEach((point, i) => {
        if (i > 0) ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();

      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fill();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const handleCanvasInteraction = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = (event.clientX || event.touches[0].clientX) - rect.left;
    const y = (event.clientY || event.touches[0].clientY) - rect.top;

    const relativeX = Number((x / canvas.width).toFixed(4));
    const relativeY = Number((y / canvas.height).toFixed(4));

    setCursorCoordinates({ x, y, relativeX, relativeY });

    // Check if cursor is inside any area
    const hoveredArea = savedAreas.find((area) =>
      isPointInPolygon({ x: relativeX, y: relativeY }, area.points)
    );

    if (hoveredArea) {
      handleInteractionStart(hoveredArea, event);
    } else {
      handleInteractionEnd();
    }
  };

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

  const handleInteractionStart = (area, event) => {
    let x, y;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const POPUP_WIDTH = 200;
    const POPUP_HEIGHT = 150;

    if (event.type.includes("touch")) {
      const touch = event.touches[0];
      x = touch.clientX;
      y = touch.clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let offsetX = 20;
    let offsetY = -30;

    if (x + offsetX + POPUP_WIDTH > viewportWidth) {
      offsetX = -POPUP_WIDTH - 20;
    }

    if (y + offsetY < 0) {
      offsetY = 20;
    } else if (y + offsetY + POPUP_HEIGHT > viewportHeight) {
      offsetY = -POPUP_HEIGHT - 20;
    }

    setPopupPosition({
      x: x + offsetX + scrollLeft,
      y: y + offsetY + scrollTop,
    });

    setHoveredArea(area.details);

    if (event.type.includes("touch")) {
      event.preventDefault();
    }
  };

  const handleInteractionEnd = () => {
    setHoveredArea(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen"
      style={{
        overflow: "auto", // Enable both scrollbars
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        className="relative"
        style={{
          width: imgSize.width,
          height: imgSize.height,
          transform: `scale(${zoom})`,
          transformOrigin: "0 0", // Change origin to top-left
          transition: "transform 200ms",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          onMouseMove={handleCanvasInteraction}
          onTouchMove={handleCanvasInteraction}
          style={{
            touchAction: "none",
            width: "100%",
            height: "100%",
          }}
        />
        <video
          ref={videoRef}
          src={landVideo}
          loop
          muted
          playsInline
          style={{ display: "none" }}
        />
      </div>

      {/* Update coordinate display to be always visible */}
      <div
        className="fixed bottom-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded z-50 text-sm"
        style={{
          position: "fixed", // Ensure it stays visible when scrolling
          zIndex: 1000,
        }}
      >
        <p>
          x:{cursorCoordinates.relativeX}, y:{cursorCoordinates.relativeY}
        </p>
      </div>

      {hoveredArea && (
        <div
          className="fixed bg-white text-black p-4 rounded shadow-lg text-sm"
          style={{
            top: `${popupPosition.y}px`,
            left: `${popupPosition.x}px`,
            maxWidth: "200px",
            transform: "translate3d(0,0,0)",
            touchAction: "none",
            pointerEvents: "none",
            zIndex: 1000, // Ensure popup stays above scrolled content
          }}
        >
          <h4 className="text-lg font-semibold">Area Details: </h4>
          <p>
            <strong>Name:</strong> {hoveredArea.name}
          </p>
          <p>
            <strong>Number:</strong> {hoveredArea.number}
          </p>
          <p>
            <strong>Rent:</strong> {hoveredArea.rent}
          </p>
          <p>
            <strong>Available:</strong> {hoveredArea.availability}
          </p>
        </div>
      )}
    </div>
  );
};

export default Main;
