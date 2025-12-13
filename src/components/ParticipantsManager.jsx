import React, { useState, useEffect } from 'react';
import { FaFileImport, FaFileExport, FaUserPlus, FaDownload, FaQrcode, FaTimes } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const ParticipantsManager = ({ participants, setParticipants }) => {
  const [newParticipant, setNewParticipant] = useState({ name: '', department: '' });
  const [showQRCode, setShowQRCode] = useState(false);
  const [employeeInput, setEmployeeInput] = useState({ name: '', department: '' });
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeFormUrl, setEmployeeFormUrl] = useState('');
  const [serverPort] = useState('5173');

  // 获取本地IP地址
  const getLocalIP = () => {
    return new Promise((resolve) => {
      // 使用WebRTC API获取本地IP
      const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
      
      if (!RTCPeerConnection) {
        resolve('localhost');
        return;
      }
      
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(() => resolve('localhost'));
      
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const ipMatch = event.candidate.candidate.match(ipRegex);
        
        if (ipMatch) {
          resolve(ipMatch[1]);
          pc.close();
        }
      };
      
      // 如果500ms内没有获取到IP，默认使用localhost
      setTimeout(() => {
        resolve('localhost');
        pc.close();
      }, 500);
    });
  };

  useEffect(() => {
    const generateUrl = async () => {
      try {
        const ip = await getLocalIP();
        setEmployeeFormUrl(`http://${ip}:${serverPort}/employee-form`);
      } catch (error) {
        console.error('获取IP地址失败:', error);
        setEmployeeFormUrl(`http://localhost:${serverPort}/employee-form`);
      }
    };
    
    generateUrl();
  }, [serverPort]);

  // 导入Excel文件
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 将Excel数据转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // 处理数据并更新参与者列表 - 支持更多格式
        const newParticipants = jsonData
          .filter(item => {
            // 支持多种可能的name字段名
            const nameField = item.name || item.Name || item['姓名'] || item['名称'];
            return nameField && typeof nameField === 'string';
          })
          .map(item => {
            // 支持多种可能的name和department字段名
            const name = item.name || item.Name || item['姓名'] || item['名称'];
            const department = item.department || item.Department || item['部门'] || item['所属部门'];
            return {
              name: String(name).trim(),
              department: department ? String(department).trim() : '未分配'
            };
          });
        
        if (newParticipants.length === 0) {
          toast.error('Excel文件格式错误，未找到有效的参与者数据。请确保文件包含"姓名"或"name"列。');
          return;
        }
        
        // 去重并合并（仅按name去重）
        const existingNames = new Set(participants.map(p => p.name));
        const uniqueNewParticipants = newParticipants.filter(p => !existingNames.has(p.name));
        const combinedParticipants = [...participants, ...uniqueNewParticipants];
        
        setParticipants(combinedParticipants);
        toast.success(`成功导入 ${newParticipants.length} 位参与者，新增 ${uniqueNewParticipants.length} 位，总人数 ${combinedParticipants.length} 位`);
      } catch (error) {
        toast.error('Excel文件导入失败：' + error.message);
        console.error('Import error:', error);
      }
    };
    
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // 重置文件输入
  };

  // 下载Excel模板
  const handleDownloadTemplate = () => {
    // 创建模板数据
    const templateData = [
      { name: '张三', department: '技术部' },
      { name: '李四', department: '市场部' },
      { name: '王五', department: '人事部' }
    ];
    
    // 创建工作簿和工作表
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '参与者信息');
    
    // 设置列宽
    worksheet['!cols'] = [
      { wch: 20 }, // name列宽
      { wch: 20 }  // department列宽
    ];
    
    // 导出模板文件
    XLSX.writeFile(workbook, '参与者信息模板.xlsx');
    toast.success('模板文件已下载');
  };

  // 导出Excel文件
  const handleExport = () => {
    if (participants.length === 0) {
      toast.info('没有参与者数据可以导出');
      return;
    }

    // 创建工作簿和工作表
    const worksheet = XLSX.utils.json_to_sheet(participants);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    
    // 导出文件
    XLSX.writeFile(workbook, 'participants.xlsx');
    toast.success(`成功导出 ${participants.length} 位参与者数据`);
  };

  // 处理员工输入表单提交
  const handleEmployeeFormSubmit = () => {
    if (!employeeInput.name.trim()) {
      toast.error('请输入姓名');
      return;
    }
    
    // 检查是否已存在相同姓名和部门的参与者
    const isDuplicate = participants.some(p => 
      p.name === employeeInput.name && p.department === employeeInput.department
    );
    
    if (isDuplicate) {
      toast.error('该参与者已存在');
      return;
    }
    
    const updatedParticipants = [...participants, employeeInput];
    setParticipants(updatedParticipants);
    setEmployeeInput({ name: '', department: '' });
    setShowEmployeeForm(false);
    toast.success('参与者添加成功');
  };
  
  // 添加单个参与者
  const handleAddParticipant = () => {
    if (!newParticipant.name.trim()) {
      toast.warning('请输入参与者姓名');
      return;
    }
    
    const participantToAdd = {
      name: newParticipant.name.trim(),
      department: newParticipant.department ? newParticipant.department.trim() : '未分配'
    };
    
    // 检查是否已存在
    if (participants.some(p => p.name === participantToAdd.name)) {
      toast.warning('该参与者已存在');
      return;
    }
    
    setParticipants([...participants, participantToAdd]);
    setNewParticipant({ name: '', department: '' });
    toast.success('成功添加参与者');
  };

  return (
    <div className="participants-manager">
      <h3>
        <FaUserPlus /> 人员管理
      </h3>
      
      <div className="manager-actions">
        <label className="excel-import-btn">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleImport} 
            style={{ display: 'none' }}
          />
          <span className="import-btn">
            <FaFileImport /> 导入Excel
          </span>
        </label>
        
        <button onClick={handleDownloadTemplate}>
          <FaDownload /> 下载模板
        </button>
        
        <button onClick={handleExport}>
          <FaFileExport /> 导出Excel
        </button>
        
        <div className="participants-count">
          总人数: {participants.length}
        </div>
      </div>
      
      <div className="add-participant-section">
        <h3>添加参与者</h3>
        <div className="form-fields">
          <div className="form-group">
            <label>姓名</label>
            <input 
              type="text" 
              value={newParticipant.name} 
              onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})} 
              placeholder="请输入姓名"
            />
          </div>
          <div className="form-group">
            <label>部门</label>
            <input 
              type="text" 
              value={newParticipant.department} 
              onChange={(e) => setNewParticipant({...newParticipant, department: e.target.value})} 
              placeholder="请输入部门"
            />
          </div>
        </div>
        <div className="add-buttons">
          <button className="add-btn" onClick={handleAddParticipant}>
            <FaUserPlus /> 添加
          </button>
          <button className="scan-btn" onClick={() => setShowQRCode(!showQRCode)}>
            <FaQrcode /> {showQRCode ? '关闭' : '生成二维码'}
          </button>
        </div>
      </div>
      
      {/* 二维码显示区域 */}
      {showQRCode && (
        <div className="scan-section">
          <div className="qrcode-container">
            <h4>员工扫码填写信息</h4>
            <div className="qrcode-display">
              <QRCodeSVG value={employeeFormUrl} size={256} />
            </div>
            <div className="qrcode-instructions">
              <p>请员工使用手机扫描上方二维码，填写姓名和部门信息</p>
              <p>或直接点击以下链接：</p>
              <a href={employeeFormUrl} target="_blank" rel="noopener noreferrer">
                {employeeFormUrl}
              </a>
            </div>
            <button className="close-btn" onClick={() => setShowQRCode(false)}>
              <FaTimes /> 关闭
            </button>
          </div>
        </div>
      )}
      
      {/* 员工输入表单（实际应用中应该是一个独立的页面） */}
      {showEmployeeForm && (
        <div className="employee-form-section">
          <div className="employee-form-container">
            <h4>员工信息填写</h4>
            <div className="form-fields">
              <div className="form-group">
                <label>姓名</label>
                <input 
                  type="text" 
                  value={employeeInput.name} 
                  onChange={(e) => setEmployeeInput({...employeeInput, name: e.target.value})} 
                  placeholder="请输入您的姓名"
                />
              </div>
              <div className="form-group">
                <label>部门</label>
                <input 
                  type="text" 
                  value={employeeInput.department} 
                  onChange={(e) => setEmployeeInput({...employeeInput, department: e.target.value})} 
                  placeholder="请输入您的部门"
                />
              </div>
            </div>
            <div className="form-buttons">
              <button className="add-btn" onClick={handleEmployeeFormSubmit}>
                <FaUserPlus /> 提交
              </button>
              <button className="cancel-btn" onClick={() => setShowEmployeeForm(false)}>
                <FaTimes /> 取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 显示导入的人员列表 */}
      <div className="participants-list-section">
        <h4>导入的人员列表</h4>
        {participants.length === 0 ? (
          <div className="empty-list">
            <p>暂无导入的人员数据</p>
          </div>
        ) : (
          <div className="participants-table-container">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>姓名</th>
                  <th>部门</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr key={index} className="participant-row">
                    <td>{index + 1}</td>
                    <td>{participant.name}</td>
                    <td>{participant.department || '未分配'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsManager;