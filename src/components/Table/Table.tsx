import styles from './Table.module.scss';
import clsx from 'clsx';
import get from 'lodash.get';

export interface TableColumn<T> {
  title: string;
  dataIndex: keyof T | string;
  className?: string;
  width?: string | number;
  align?: 'left' | 'right' | 'center';
  noWrap?: boolean;
  render?: (value: T[keyof T], record: T) => React.ReactNode;
}

export interface TableProps<T> {
  className?: string;
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey: keyof T;
}

export default function Table<T extends object>(props: TableProps<T>) {
  const { className, columns, dataSource, rowKey } = props;

  return (
    <table className={clsx(styles.table, className)}>
      <thead>
        <tr>
          {columns.map((column) => {
            return (
              <th
                key={String(column.dataIndex)}
                className={column.className}
                style={{ width: column.width, textAlign: column.align }}
              >
                {column.title}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {dataSource.map((record, recordIndex) => {
          return (
            <tr key={String(record[rowKey]) || recordIndex}>
              {columns.map((column) => {
                const value = get(record, column.dataIndex);
                const content = column.render ? column.render(value, record) : value;
                return (
                  <td
                    key={String(column.dataIndex)}
                    className={column.className}
                    style={{ width: column.width, textAlign: column.align }}
                  >
                    {column.noWrap ? <span className={styles.noWrap}>{content}</span> : content}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
