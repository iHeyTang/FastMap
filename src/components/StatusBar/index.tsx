import { Button, Checkbox, Space, Tag } from "antd";
import React, { useState } from "react";

export interface StatusBarProps {
  style?: React.CSSProperties;
  info: { cursorPosition: [number, number] };
  onClickAssignTask?: () => void;
  onClickCancelTask?: () => void;
  onCheckedShowPoint?: (showPoint: boolean) => void;
}

export const StatusBar: React.FC<StatusBarProps> = (props) => {
  const [showPoint, setShowPoint] = useState<boolean>(false);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        backgroundColor: "white",
        display: "flex",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        paddingLeft: 32,
        ...(props.style || {}),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <h3 style={{ marginRight: 48 }}>FastMap</h3>
          <Space>
            <Space.Compact>
              <Button
                size="small"
                type="primary"
                onClick={props.onClickAssignTask}
              >
                下发任务
              </Button>
              <Button size="small" onClick={props.onClickCancelTask}>
                取消任务
              </Button>
            </Space.Compact>
          </Space>
        </Space>

        <Space align="end">
          <Checkbox
            checked={showPoint}
            onChange={(e) => {
              setShowPoint(e.target.checked);
              props.onCheckedShowPoint?.(e.target.checked);
            }}
            style={{ boxShadow: "none" }}
          >
            坐标
          </Checkbox>
          <Tag color="blue">
            <div style={{ width: 100, textAlign: "center" }}>
              {props.info.cursorPosition[0].toFixed(2)},{" "}
              {-props.info.cursorPosition[1].toFixed(2)}
            </div>
          </Tag>
        </Space>
      </div>
    </div>
  );
};
