import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FaUser, FaGift, FaPlay, FaPause, FaStop, FaUpload, FaDownload, FaCog } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import LotterySphere from './components/LotterySphere';
import PrizeConfig from './components/PrizeConfig';
import ParticipantsManager from './components/ParticipantsManager';
import EmployeeForm from './components/EmployeeForm';
import Tutorial from './components/Tutorial';
import './App.css';

function App() {
  const [participants, setParticipants] = useState([]);
  const [prizes, setPrizes] = useState([
    { id: 1, name: 'iPhone 17 Pro Max', count: 1, level: '一等奖' },
    { id: 2, name: 'AirPods Pro', count: 3, level: '二等奖' },
    { id: 3, name: '京东卡 100元', count: 10, level: '三等奖' },
    { id: 4, name: '定制保温杯', count: 50, level: '纪念奖' }
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [winners, setWinners] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [currentPrize, setCurrentPrize] = useState(prizes[0]);
  const [allowDuplicateWinners, setAllowDuplicateWinners] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [pageTitle, setPageTitle] = useState('智能抽奖系统');
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  const handleWinner = (winner) => {
    // Check if current prize has reached max winners
    const currentPrizeWinnersCount = winners.filter(w => w.prize.id === currentPrize.id).length;
    if (currentPrizeWinnersCount >= currentPrize.count) {
      toast.error(`当前奖项 ${currentPrize.name} 已达到最大中奖人数 (${currentPrize.count}人)`);
      return;
    }
    
    // Create winning record
    const winningRecord = {
      id: Date.now() + Math.random(),
      ...winner,
      prize: currentPrize,
      time: new Date().toLocaleString()
    };
    
    // Update winners list
    setWinners(prevWinners => [...prevWinners, winningRecord]);
    
    // Set selected winner for 3D effect
    setSelectedWinner(winningRecord);
    
    // Remove winner from participants if duplicates not allowed
    if (!allowDuplicateWinners) {
      setParticipants(prevParticipants => 
        prevParticipants.filter(p => p.name !== winner.name)
      );
    }
    
    // Update prize count and check if need to switch to next prize
    setPrizes(prevPrizes => {
      const updatedPrizes = prevPrizes.map(prize => {
        if (prize.id === currentPrize.id) {
          return { ...prize, count: prize.count - 1 };
        }
        return prize;
      });
      
      // Get updated current prize
      const updatedCurrentPrize = updatedPrizes.find(p => p.id === currentPrize.id);
      
      // If current prize is exhausted, switch to next prize
      if (updatedCurrentPrize && updatedCurrentPrize.count <= 0) {
        const currentPrizeIndex = prevPrizes.findIndex(p => p.id === currentPrize.id);
        const nextPrizeIndex = currentPrizeIndex + 1;
        if (nextPrizeIndex < prevPrizes.length) {
          setCurrentPrize(prevPrizes[nextPrizeIndex]);
        }
      }
      
      // Filter out prizes with 0 count
      return updatedPrizes.filter(prize => prize.count > 0);
    });
    
    // Show success notification
    toast.success(`🎉 恭喜 ${winner.name} 获得 ${currentPrize.name}`);
  };

  const toggleSpin = () => {
    if (participants.length === 0) {
      toast.error('请先添加参与者');
      return;
    }
    if (!currentPrize) {
      toast.error('请先配置奖品');
      return;
    }
    setIsSpinning(!isSpinning);
  };

  const resetLottery = () => {
    setIsSpinning(false);
    setWinners([]);
    toast.info('抽奖已重置');
  };

  // 初始化系统，加载本地存储的数据
  useEffect(() => {
    const savedParticipants = localStorage.getItem('participants');
    const savedPrizes = localStorage.getItem('prizes');
    const savedWinners = localStorage.getItem('winners');
    const savedPageTitle = localStorage.getItem('pageTitle');
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    
    if (savedParticipants) {
      setParticipants(JSON.parse(savedParticipants));
    }
    
    if (savedPrizes) {
      setPrizes(JSON.parse(savedPrizes));
    }
    
    if (savedWinners) {
      setWinners(JSON.parse(savedWinners));
    }
    
    if (savedPageTitle) {
      setPageTitle(savedPageTitle);
    }
    
    // 如果用户首次访问，显示教程
    if (!hasSeenTutorial) {
      // 延迟显示教程，确保页面已加载完成
      setTimeout(() => {
        setIsTutorialVisible(true);
      }, 1000);
    }
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    localStorage.setItem('participants', JSON.stringify(participants));
    localStorage.setItem('prizes', JSON.stringify(prizes));
    localStorage.setItem('winners', JSON.stringify(winners));
  }, [participants, prizes, winners]);

  // 保存标题到本地存储
  useEffect(() => {
    localStorage.setItem('pageTitle', pageTitle);
  }, [pageTitle]);
  
  // 处理教程关闭
  const handleTutorialClose = () => {
    setIsTutorialVisible(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };
  
  // 手动显示教程
  const handleShowTutorial = () => {
    setIsTutorialVisible(true);
  };

  const handleEmployeeSubmit = (employeeData) => {
    const newParticipant = {
      id: Date.now(),
      name: employeeData.name.trim(),
      department: employeeData.department.trim() || '未填写',
      isWinner: false
    };
    
    if (participants.some(p => p.name === newParticipant.name)) {
      toast.error('该员工已存在');
      return;
    }
    
    setParticipants(prev => [...prev, newParticipant]);
    toast.success(`${newParticipant.name} 添加成功！`);
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="app">
          <ToastContainer position="top-right" autoClose={3000} />
          
          <header className="header">
            <h1 className="title">🎉 {pageTitle || '智能抽奖系统'}</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="config-btn"
              onClick={() => setShowConfig(!showConfig)}
            >
              <FaCog /> {showConfig ? '关闭配置' : '配置'}
            </button>
            <button 
              className="config-btn"
              onClick={handleShowTutorial}
            >
              📖 教程
            </button>
          </div>
          </header>

          {showConfig && (
            <div className="config-panel">
              <div className="config-content">
                {/* 系统配置 */}
                <div className="system-config">
                  <h3>系统配置</h3>
                  <div className="config-item">
                    <label>首页标题：</label>
                    <input
                      type="text"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value.trim())}
                      placeholder="请输入首页标题"
                      className="config-input"
                    />
                  </div>
                </div>
                <PrizeConfig prizes={prizes} setPrizes={setPrizes} />
                <ParticipantsManager participants={participants} setParticipants={setParticipants} />
              </div>
            </div>
          )}

          <main className="main-content">
            <div className="lottery-section">
              <div className="canvas-container">
                <LotterySphere
                  participants={participants}
                  isSpinning={isSpinning}
                  rotationSpeed={speed}
                  onWinner={handleWinner}
                  winner={selectedWinner}
                />
              </div>

              <div className="control-panel">
                <div className="prize-info">
                  <h3>当前奖项：</h3>
                  <select 
                    value={currentPrize?.id}
                    onChange={(e) => {
                      const selectedPrize = prizes.find(p => p.id === parseInt(e.target.value));
                      if (selectedPrize) setCurrentPrize(selectedPrize);
                    }}
                    disabled={isSpinning}
                  >
                    {prizes.map(prize => (
                      <option key={prize.id} value={prize.id}>
                        {prize.level} - {prize.name} (剩余: {prize.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="speed-control">
                  <label>旋转速度：</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    disabled={isSpinning}
                  />
                  <span>{speed.toFixed(1)}x</span>
                </div>

                <div className="duplicate-control">
                  <label className="duplicate-checkbox">
                    <input
                      type="checkbox"
                      checked={allowDuplicateWinners}
                      onChange={(e) => setAllowDuplicateWinners(e.target.checked)}
                      disabled={isSpinning}
                    />
                    <span>允许重复中奖</span>
                  </label>
                </div>

                <div className="control-buttons">
                  <button 
                    className={`control-btn play-btn ${isSpinning ? 'active' : ''}`}
                    onClick={toggleSpin}
                  >
                    {isSpinning ? <FaPause /> : <FaPlay />} {isSpinning ? '停止' : '开始'}
                  </button>
                  <button 
                    className="control-btn batch-btn"
                    onClick={() => {
                      if (participants.length === 0) {
                        toast.error('请先添加参与者');
                        return;
                      }
                      if (!currentPrize) {
                        toast.error('请先配置奖品');
                        return;
                      }
                      
                      const currentPrizeWinnersCount = winners.filter(w => w.prize.id === currentPrize.id).length;
                      const remainingPrizes = currentPrize.count - currentPrizeWinnersCount;
                      
                      if (remainingPrizes <= 0) {
                        toast.error(`当前奖项 ${currentPrize.name} 已没有剩余奖品`);
                        return;
                      }
                      
                      const availableParticipants = allowDuplicateWinners ? participants : 
                        participants.filter(p => !winners.some(w => w.name === p.name));
                      
                      if (availableParticipants.length === 0) {
                        toast.error('没有可抽取的参与者');
                        return;
                      }
                      
                      const drawCount = Math.min(remainingPrizes, availableParticipants.length);
                      const winnersToDraw = drawCount === availableParticipants.length ? 
                        [...availableParticipants] : 
                        [...availableParticipants].sort(() => 0.5 - Math.random()).slice(0, drawCount);
                      
                      winnersToDraw.forEach((winner, index) => {
                        setTimeout(() => {
                          handleWinner(winner);
                        }, index * 1000);
                      });
                      
                      toast.info(`开始批量抽取 ${drawCount} 名中奖者...`);
                    }}
                    disabled={isSpinning}
                  >
                    <FaPlay /> 批量抽取
                  </button>
                  <button 
                    className="control-btn stop-btn"
                    onClick={resetLottery}
                    disabled={isSpinning}
                  >
                    <FaStop /> 重置
                  </button>
                </div>
              </div>
            </div>

            <div className="winners-section">
              <div className="winners-header">
                <h3>🏆 中奖记录</h3>
                <button 
                  className="save-winners-btn"
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + "序号,姓名,部门,奖项,时间\n" 
                      + winners.map((winner, index) => 
                          `${index + 1},${winner.name},${winner.department || ''},${winner.prize.name},${winner.time}`
                        ).join("\n");
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `中奖记录_${new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('中奖记录已导出为CSV文件');
                  }}
                >
                  <FaDownload /> 导出中奖记录
                </button>
              </div>
              
              <div className="winners-list">
                {winners.length === 0 ? (
                  <div className="no-winners">
                    <p>🎯 暂无中奖记录</p>
                    <p className="hint">点击开始按钮进行抽奖</p>
                  </div>
                ) : (
                  <div className="winners-grid">
                    {winners.map((winner, index) => (
                      <div key={index} className="winner-card">
                        <div className="winner-rank">
                          {index + 1}
                        </div>
                        <div className="winner-info">
                          <h4 className="winner-name">{winner.name}</h4>
                          <p className="winner-department">{winner.department || '未知部门'}</p>
                        </div>
                        <div className="winner-prize">
                          <span className={`prize-badge ${winner.prize.level}`}>
                            {winner.prize.level}
                          </span>
                          <p className="prize-name">{winner.prize.name}</p>
                        </div>
                        <div className="winner-time">
                          {winner.time}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="winners-summary">
                <p>🎯 总中奖人数：<strong>{winners.length}</strong></p>
                <p>🎁 当前奖项已中奖：<strong>{winners.filter(w => w.prize.id === currentPrize.id).length}/{currentPrize?.count || 0}</strong></p>
              </div>
            </div>
          </main>

          <footer className="footer">
            <p>© 2025 {pageTitle || '智能抽奖系统'} | 由阿里云ESA提供加速、计算和保护</p>
          </footer>
          
          {/* 教程组件 */}
          <Tutorial 
            isVisible={isTutorialVisible} 
            onClose={handleTutorialClose} 
          />
        </div>
      } />
      
      <Route path="/employee-form" element={<EmployeeForm onFormSubmit={handleEmployeeSubmit} />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;