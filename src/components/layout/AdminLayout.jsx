import {AdminMenu, Header} from '../';
import {elementType, object, oneOfType} from 'prop-types';

const AdminLayout = ({children}) => (
  <div className="flex flex-col min-h-screen">
    <Header className="fixed" />
    <div className="flex w-full min-h-screen">
      <div className="fixed top-24 h-relative w-60 shadow-r bg-white">
        <AdminMenu />
      </div>
      <div className="w-full ml-64 mt-36">
        {children}
      </div>
    </div>
  </div>
);

AdminLayout.propTypes = {
  children : oneOfType([object, elementType]).isRequired
};


AdminLayout.displayName = 'AdminLayout';
export default AdminLayout;
