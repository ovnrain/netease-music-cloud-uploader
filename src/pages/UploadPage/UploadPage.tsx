// import styles from './UploadPage.module.scss';

import { Link } from 'react-router-dom';

export interface UploadPageProps {}

const UploadPage = (props: UploadPageProps) => {
  return (
    <div>
      <div>upload</div>
      <div>
        <Link to="/">返回列表</Link>
      </div>
    </div>
  );
};

export default UploadPage;
