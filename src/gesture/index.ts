import FastMap from "../fast-map";

/**
 * 实现地图拖拽功能
 * @param canvas
 */
export const handleDrag = (canvas: fabric.Canvas) => {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.on("mouse:move", (event) => {
    if (isDragging) {
      const e = event.e;
      const currentX = e.clientX;
      const currentY = e.clientY;

      const deltaX = currentX - lastX;
      const deltaY = currentY - lastY;

      const viewportTransform = [...(canvas.viewportTransform || [])];
      if (typeof viewportTransform[4] === "number") {
        viewportTransform[4] += deltaX;
      }
      if (typeof viewportTransform[5] === "number") {
        viewportTransform[5] += deltaY;
      }
      canvas.setViewportTransform(viewportTransform);

      lastX = currentX;
      lastY = currentY;
    }
  });

  canvas.on("mouse:down", (event) => {
    isDragging = true;
    const e = event.e;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.on("mouse:up", () => {
    isDragging = false;
  });
};

export const handleClick = (
  canvas: fabric.Canvas,
  handler: (e: fabric.IEvent<MouseEvent>) => void
) => {
  let lastX = 0;
  let lastY = 0;

  canvas.on("mouse:down", (event) => {
    const e = event.e;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.on("mouse:up", (event) => {
    if (event.e.clientX === lastX && event.e.clientY === lastY) {
      handler(event);
    }
  });
};

export const handleDbClick = (
  canvas: fabric.Canvas,
  handler: (e: fabric.IEvent<MouseEvent>) => void
) => {
  canvas.on("mouse:dblclick", handler);
};

export const handleScale = (canvas: fabric.Canvas) => {
  canvas.on("mouse:wheel", (event) => {
    const e = event.e as WheelEvent;
    const delta = e.deltaY;
    let zoom = canvas.getZoom();
    zoom = zoom + delta / 2000;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
    e.preventDefault();
    e.stopPropagation();
  });
};
