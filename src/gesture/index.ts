/**
 * 实现地图拖拽功能
 * @param canvas
 */
export const draggable = (canvas: fabric.Canvas) => {
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

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      canvas.viewportTransform![4] += deltaX;
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      canvas.viewportTransform![5] += deltaY;

      canvas.requestRenderAll();

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

export const scalable = (canvas: fabric.Canvas) => {
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
