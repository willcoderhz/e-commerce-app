import React from 'react';
import axios from 'axios';

function Navbar() {
  const handleLogout = async () => {
    try {
      const response = await axios.get('/logout');
      console.log(response.data.message);
      // 在此处处理注销成功后的操作，如重定向到登录页面
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav>
      {/* 其他导航链接 */}
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
