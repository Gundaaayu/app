import React, { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import land from "/src/assets/land.jpg";
import landVideo from "/src/assets/land.mp4";

const savedAreas = [
  {
    points: [
      {
        x: 0.27460202604920403,
        y: 0.18392282958199357,
      },
      {
        x: 0.28871201157742404,
        y: 0.18778135048231512,
      },
      {
        x: 0.28726483357452964,
        y: 0.21864951768488747,
      },
      {
        x: 0.27098408104196814,
        y: 0.21736334405144694,
      },
    ],
    details: {
      name: "New Name",
      number: "8861245501",
      rent: "New",
      availability: "30000",
    },
    videoTimestamp: 6.436176,
  },
  {
    points: [
      {
        x: 0.1975397973950796,
        y: 0.4270096463022508,
      },
      {
        x: 0.22069464544138928,
        y: 0.4212218649517685,
      },
      {
        x: 0.2239507959479016,
        y: 0.45016077170418006,
      },
      {
        x: 0.2011577424023155,
        y: 0.45787781350482315,
      },
    ],
    details: {
      name: "",
      number: "",
      rent: "",
      availability: "",
    },
    videoTimestamp: 9.064513,
  },
  {
    points: [
      {
        x: 0.22829232995658466,
        y: 0.48360128617363346,
      },
      {
        x: 0.25180897250361794,
        y: 0.4797427652733119,
      },
      {
        x: 0.25578871201157743,
        y: 0.5054662379421222,
      },
      {
        x: 0.23118668596237338,
        y: 0.5144694533762058,
      },
    ],
    details: {
      name: "",
      number: "",
      rent: "",
      availability: "",
    },
    videoTimestamp: 5.432679,
  },
  {
    points: [
      {
        x: 0.2076700434153401,
        y: 0.5266881028938907,
      },
      {
        x: 0.229739507959479,
        y: 0.5189710610932476,
      },
      {
        x: 0.23227206946454415,
        y: 0.5729903536977492,
      },
      {
        x: 0.20875542691751087,
        y: 0.5794212218649518,
      },
    ],
    details: {
      name: "",
      number: "",
      rent: "",
      availability: "",
    },
    videoTimestamp: 11.17728,
  },
  {
    points: [
      {
        x: 0.2659189580318379,
        y: 0.44308681672025724,
      },
      {
        x: 0.2897973950795948,
        y: 0.4347266881028939,
      },
      {
        x: 0.29196816208393633,
        y: 0.4694533762057878,
      },
      {
        x: 0.2691751085383502,
        y: 0.4739549839228296,
      },
    ],
    details: {
      name: "",
      number: "",
      rent: "",
      availability: "",
    },
    videoTimestamp: 10.045749,
  },
  {
    points: [
      {
        x: 0.27206946454413894,
        y: 0.5086816720257235,
      },
      {
        x: 0.2934153400868307,
        y: 0.5041800643086817,
      },
      {
        x: 0.30137481910274966,
        y: 0.5536977491961415,
      },
      {
        x: 0.2771345875542692,
        y: 0.5594855305466238,
      },
    ],
    details: {
      name: "",
      number: "",
      rent: "",
      availability: "",
    },
    videoTimestamp: 8.929146,
  },
  {
    points: [
      {
        x: 0.3288712011577424,
        y: 0.3948553054662379,
      },
      {
        x: 0.3480463096960926,
        y: 0.38713826366559484,
      },
      {
        x: 0.34913169319826337,
        y: 0.4180064308681672,
      },
      {
        x: 0.3310419681620839,
        y: 0.4212218649517685,
      },
    ],
    details: {
      name: "",
      number: "",
      rent: "",
      availability: "",
    },
    videoTimestamp: 4.309336,
  },
  {
    points: [
      {
        x: 0.3350217076700434,
        y: 0.4932475884244373,
      },
      {
        x: 0.3621562952243126,
        y: 0.4829581993569132,
      },
      {
        x: 0.3664978292329957,
        y: 0.5073954983922829,
      },
      {
        x: 0.3712011577424023,
        y: 0.5118971061093247,
      },
      {
        x: 0.3708393632416787,
        y: 0.5299035369774919,
      },
      {
        x: 0.34117221418234445,
        y: 0.5440514469453376,
      },
    ],
    details: {
      name: "",
      number: "",
      rent: "",
      availability: "",
    },
    videoTimestamp: 4.412386,
  },
  {
    points: [
      {
        x: 0.1573806078147612,
        y: 0.470096463022508,
      },
      {
        x: 0.18560057887120116,
        y: 0.4617363344051447,
      },
      {
        x: 0.18849493487698987,
        y: 0.4945337620578778,
      },
      {
        x: 0.16027496382054993,
        y: 0.5003215434083601,
      },
    ],
    details: {
      name: "",
      number: "",
      rent: "",
      availability: "",
    },
    videoTimestamp: 9.221054,
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
