import React, { useState } from "react";
import { Table, Input, Button, Space, Card, Typography, Tooltip } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

const { Title } = Typography;
const { Search } = Input;

export interface DataTableColumn<T> {
    title: string;
    dataIndex: keyof T;
    key: string;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    width?: number | string;
    sorter?: boolean;
    filterable?: boolean;
}

export interface DataTableAction<T> {
    label: string;
    onClick: (record: T) => void;
    type?: "primary" | "default" | "dashed" | "link" | "text";
    danger?: boolean;
    icon?: React.ReactNode;
    disabled?: (record: T) => boolean;
    showLabel?: boolean;
    tooltip?: string;
}

export interface DataTableProps<T> {
    title: string;
    data: T[];
    columns: DataTableColumn<T>[];
    loading?: boolean;
    pagination?: TablePaginationConfig | false;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    addButtonText?: string;
    actions?: DataTableAction<T>[];
    rowKey: keyof T | ((record: T) => string);
    size?: "small" | "middle" | "large";
    bordered?: boolean;
    searchPlaceholder?: string;
    actionButtonSize?: "small" | "middle" | "large";
    actionColumnWidth?: number | string;
}

function DataTable<T extends Record<string, any>>({
    title,
    data,
    columns,
    loading = false,
    pagination,
    onSearch,
    onAdd,
    addButtonText = "Add New",
    actions = [],
    rowKey,
    size = "middle",
    bordered = true,
    searchPlaceholder = "Search...",
    actionButtonSize = "middle",
    actionColumnWidth = "auto",
}: Readonly<DataTableProps<T>>) {
    const [searchValue, setSearchValue] = useState("");

    // Convert custom columns to Ant Design table columns
    const tableColumns: ColumnsType<T> = [
        ...columns.map((col) => ({
            title: col.title,
            dataIndex: col.dataIndex as string,
            key: col.key,
            render: col.render,
            width: col.width,
            sorter: col.sorter,
            ...(col.filterable && {
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
                    <div style={{ padding: 8 }}>
                        <Input
                            placeholder={`Search ${col.title}`}
                            value={selectedKeys[0]}
                            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                            onPressEnter={() => confirm()}
                            style={{ marginBottom: 8, display: "block" }}
                        />
                        <Space>
                            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
                                Search
                            </Button>
                            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
                                Reset
                            </Button>
                        </Space>
                    </div>
                ),
                filterIcon: (filtered: boolean) => (
                    <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
                ),
                onFilter: (value: any, record: T) =>
                    record[col.dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
            }),
        })),
        ...(actions.length > 0
            ? [
                  {
                      title: "Actions",
                      key: "actions",
                      width: actionColumnWidth === "auto" ? undefined : actionColumnWidth,
                      render: (_: any, record: T) => (
                          <Space size="small">
                              {actions.map((action, index) => {
                                  const button = (
                                      <Button
                                          key={index}
                                          type={action.type || "default"}
                                          size={actionButtonSize}
                                          danger={action.danger}
                                          icon={action.icon}
                                          disabled={action.disabled ? action.disabled(record) : false}
                                          onClick={() => action.onClick(record)}
                                      >
                                          {action.showLabel === false ? undefined : action.label}
                                      </Button>
                                  );

                                  return action.tooltip ? (
                                      <Tooltip key={index} title={action.tooltip}>
                                          {button}
                                      </Tooltip>
                                  ) : (
                                      button
                                  );
                              })}
                          </Space>
                      ),
                  },
              ]
            : []),
    ];

    const handleSearch = (value: string) => {
        setSearchValue(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <Title level={3} className="mb-0">
                    {title}
                </Title>
                <Space>
                    {onSearch && (
                        <Search
                            placeholder={searchPlaceholder}
                            allowClear
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onSearch={handleSearch}
                            style={{ width: 250 }}
                        />
                    )}
                    {onAdd && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                            {addButtonText}
                        </Button>
                    )}
                </Space>
            </div>

            <Table<T>
                columns={tableColumns}
                dataSource={data}
                rowKey={rowKey}
                loading={loading}
                pagination={pagination}
                size={size}
                bordered={bordered}
                scroll={{ x: "max-content" }}
            />
        </Card>
    );
}

export default DataTable;
