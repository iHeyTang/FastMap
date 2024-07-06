import { Canvas, Point, TPointerEvent, TPointerEventInfo } from "fabric";

export const handleClick = (
  canvas: Canvas,
  handler: (e: TPointerEventInfo<TPointerEvent>) => void
) => {
  let lastX = 0;
  let lastY = 0;

  canvas.on("mouse:down", (event) => {
    lastX = event.scenePoint.x;
    lastY = event.scenePoint.y;
  });

  canvas.on("mouse:up", (event) => {
    if (event.scenePoint.x === lastX && event.scenePoint.y === lastY) {
      handler(event);
    }
  });
};

export const handleDbClick = (
  canvas: Canvas,
  handler: (e: TPointerEventInfo<TPointerEvent>) => void
) => {
  canvas.on("mouse:dblclick", handler);
};

export const handleScale = (canvas: Canvas) => {
  canvas.on("mouse:wheel", (event) => {
    const e = event.e as WheelEvent;
    const delta = e.deltaY;
    let zoom = canvas.getZoom();
    zoom = zoom + delta / 2000;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom);
    e.preventDefault();
    e.stopPropagation();
  });
};
