import styles from './ErrorPage.module.scss';
import React from 'react';
import { useRouteError } from 'react-router-dom';

export interface ErrorPageProps {}

const ErrorPage = (props: ErrorPageProps) => {
  const error = useRouteError() as { statusText?: string; message?: string };
  return (
    <div className={styles.container}>
      <p>错误</p>
      <p>{error.statusText || error.message}</p>
    </div>
  );
};

export default ErrorPage;
