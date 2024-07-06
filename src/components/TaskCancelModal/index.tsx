import { Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import { FastMap } from "../map";

export interface TaskCancelModalProps {
  onOk: (e: { fastMap: FastMap }) => Promise<void>;
  onCancel: () => void;
}

export interface TaskCancelModalRef {
  show: (e: { fastMap: FastMap }) => void;
}

export const TaskCancelModal = forwardRef<
  TaskCancelModalRef,
  TaskCancelModalProps
>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);

  const [params, setParams] = useState<{ fastMap: FastMap } | undefined>();

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
      title="取消当前任务"
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
      <div>确认取消当前机器人的任务?</div>
      <div>{params?.fastMap.shapes.robots[0].key}</div>
    </Modal>
  );
});
