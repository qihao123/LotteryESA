import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaBuilding, FaCheckCircle, FaTimes } from 'react-icons/fa';

// 员工表单组件（实际应用中应该有后端API支持）
const EmployeeForm = ({ onFormSubmit }) => {
  const [employeeInfo, setEmployeeInfo] = useState({ name: '', department: '' });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!employeeInfo.name.trim()) {
      alert('请输入姓名');
      return;
    }
    
    // 实际应用中，这里应该发送API请求到后端保存数据
    // 这里我们通过回调函数将数据传递给父组件
    if (onFormSubmit) {
      onFormSubmit(employeeInfo);
    }
    
    setSubmitted(true);
    
    // 3秒后自动返回首页
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };
  
  return (
    <div className="employee-form-page">
      <div className="employee-form-wrapper">
        <h1 className="form-title">员工信息填写</h1>
        
        {submitted ? (
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <h2>提交成功！</h2>
            <p>您的信息已成功提交。</p>
            <p>3秒后自动返回首页...</p>
          </div>
        ) : (
          <form className="employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">姓名</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={employeeInfo.name}
                  onChange={handleInputChange}
                  placeholder="请输入您的姓名"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="department">部门</label>
              <div className="input-with-icon">
                <FaBuilding className="input-icon" />
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={employeeInfo.department}
                  onChange={handleInputChange}
                  placeholder="请输入您的部门"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                <FaCheckCircle /> 提交
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
                <FaTimes /> 返回
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;