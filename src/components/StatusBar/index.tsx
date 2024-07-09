import { Button, Checkbox, Space, Tag } from "antd";
import React, { useState } from "react";

export interface StatusBarProps {
  style?: React.CSSProperties;
  info: {
    cursorPosition: [number, number];
    robotInfo?: { id: string; pos: number[]; angle: number };
  };
  onClickAssignTask?: () => void;
  onClickCancelTask?: () => void;
  onCheckedShowPoint?: (showPoint: boolean) => void;
  leftExtra?: React.ReactNode[];
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
            {!props.info.robotInfo?.id && <Tag>未连接机器人</Tag>}
            {props.info.robotInfo?.id && (
              <Tag key="show">
                <Space>
                  <div>机器人: {props.info.robotInfo?.id}</div>
                  <div>
                    坐标: {props.info.robotInfo?.pos[0] || 0},
                    {props.info.robotInfo?.pos[1] || 0}
                  </div>
                  <div>朝向: {props.info.robotInfo.angle}</div>
                </Space>
              </Tag>
            )}
          </Space>
          {props.leftExtra}
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
            <div style={{ width: 140, textAlign: "center" }}>
              {props.info.cursorPosition[0].toFixed(2)},{" "}
              {-props.info.cursorPosition[1].toFixed(2)}
            </div>
          </Tag>
        </Space>
      </div>
    </div>
  );
};
