import { Fragment, useState } from 'react'

import Accordion from '@/components/common/Accordion/Accordion'

import type { ReactNode } from 'react'

import './Table.css'

export interface TableColumn<Row extends object> {
  key: string,
  label: string,
  render?: (row: Row) => ReactNode,
}

export interface TableProps<Row extends object> {
  columns: TableColumn<Row>[],
  rows: Row[],
  getRowKey: (row: Row, index: number) => string | number,
  emptyMessage?: string,
  renderExpandedRow?: (row: Row) => ReactNode,
}

const Table = <Row extends object>({
  columns,
  rows,
  getRowKey,
  emptyMessage = '표시할 데이터가 없습니다.',
  renderExpandedRow,
}: TableProps<Row>) => {
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())

  const toggleRow = (rowKey: string | number) => {
    setExpandedRows(currentRows => {
      const nextRows = new Set(currentRows)

      if (nextRows.has(rowKey)) {
        nextRows.delete(rowKey)
      } else {
        nextRows.add(rowKey)
      }

      return nextRows
    })
  }

  return (
    <div className="common-table-wrapper">
      <table className="common-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
            {renderExpandedRow ? <th scope="col">상세</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row, index) => {
            const rowKey = getRowKey(row, index)
            const isExpanded = expandedRows.has(rowKey)

            return (
              <Fragment key={rowKey}>
                <tr>
                  {columns.map(column => (
                    <td key={column.key}>
                      {column.render ? column.render(row) : String(row[column.key as keyof Row])}
                    </td>
                  ))}
                  {renderExpandedRow ? (
                    <td>
                      <button
                        type="button"
                        className="common-table-expand-button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? '상세 정보 접기' : '상세 정보 펼치기'}
                        title={isExpanded ? '상세 정보 접기' : '상세 정보 펼치기'}
                        onClick={() => toggleRow(rowKey)}
                      >
                        <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
                      </button>
                    </td>
                  ) : null}
                </tr>
                {renderExpandedRow && isExpanded ? (
                  <tr className="common-table-expanded-row">
                    <td colSpan={columns.length + 1}>
                      <Accordion
                        title="상세 정보"
                        isOpen
                        showTrigger={false}
                      >
                        {renderExpandedRow(row)}
                      </Accordion>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          }) : (
            <tr>
              <td
                className="common-table-empty"
                colSpan={columns.length + (renderExpandedRow ? 1 : 0)}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
