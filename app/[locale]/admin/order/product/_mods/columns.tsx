"use client";

import { useTransition } from "react";

import { Button, Popconfirm, Space, type TableColumnsType } from "antd";

import { type ChargeProductSelectDto } from "@/db/type";
import { formatPrice } from "@/lib/utils";

import { deleteAction } from "../_lib/actions";
import { UpdateDialog } from "./update-dialog";

const DeleteAction = (props: { id: string }) => {
  const [isDeletePending, startDeleteTransition] = useTransition();

  const confirm = () => {
    startDeleteTransition(() => {
      deleteAction({ id: props.id });
    });
  };

  return (
    <Popconfirm
      title="Do you want to delete this item?"
      description="After deletion, it will not be recoverable"
      onConfirm={confirm}
      onCancel={() => {}}
      okText="Yes"
      cancelText="No"
    >
      <Button
        danger
        type="default"
        disabled={isDeletePending}
        loading={isDeletePending}
      >
        Delete
      </Button>
    </Popconfirm>
  );
};

export function getColumns(): TableColumnsType<ChargeProductSelectDto> {
  return [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (price) => formatPrice(price, "$"),
    },
    {
      title: "Original Amount",
      dataIndex: "originalAmount",
      render: (price) => formatPrice(price, "$"),
    },
    {
      title: "Credits",
      dataIndex: "credit",
    },
    {
      title: "Currency",
      dataIndex: "currency",
    },
    {
      title: "Creem Product ID",
      dataIndex: "creemProductId",
      render: (value) => value || "-",
    },
    {
      title: "State",
      dataIndex: "state",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Action",
      dataIndex: "actions",
      render: (_date, row: ChargeProductSelectDto) => {
        return (
          <Space>
            <UpdateDialog detail={row} />
            <DeleteAction id={row.id} />
          </Space>
        );
      },
    },
  ];
}
