import { Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import { IndicatorResult } from "../map/shapes/indicator";
import { FastMap } from "../map";

export interface TaskAssignModalProps {
  onOk: (e: IndicatorResult & { fastMap: FastMap }) => Promise<void>;
  onCancel: () => void;
}

export interface TaskAssignModalRef {
  show: (e: IndicatorResult & { fastMap: FastMap }) => void;
}

export const TaskAssignModal = forwardRef<
  TaskAssignModalRef,
  TaskAssignModalProps
>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);

  const [params, setParams] = useState<
    (IndicatorResult & { fastMap: FastMap }) | undefined
  >();

  useImperativeHandle(ref, () => {
    return {
      show: (e) => {
        setOpen(true);
        setParams(e);
      },
    };
  });

  return (
    <Modal
      title="派遣机器人"
      open={open}
      onOk={async () => {
        if (!params) return;
        await props.onOk(params);
        setOpen(false);
      }}
      onCancel={() => {
        props.onCancel();
        setOpen(false);
      }}
    >
      <div>
        {params?.waypointKey === 0 || params?.waypointKey
          ? `点位 ${params?.waypointKey}，朝向${params?.angle}度，请确认派遣任务，或中止已有任务`
          : `坐标 (${params?.x}, ${params?.y})，朝向${params?.angle}度，请确认派遣任务`}
      </div>
      <div>{params?.fastMap.shapes.robots[0].key}</div>
    </Modal>
  );
});
