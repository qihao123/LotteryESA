import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const PrizeConfig = ({ prizes, setPrizes }) => {
  const [newPrize, setNewPrize] = useState({
    name: '',
    level: '',
    quantity: 1
  });

  // 添加新奖品
  const handleAddPrize = () => {
    if (!newPrize.name.trim() || !newPrize.level.trim()) return;
    
    const existingPrize = prizes.find(prize => prize.name === newPrize.name && prize.level === newPrize.level);
    if (existingPrize) {
      // 更新现有奖品数量
      const updatedPrizes = prizes.map(prize => 
        prize.name === newPrize.name && prize.level === newPrize.level 
          ? { ...prize, quantity: prize.quantity + newPrize.quantity }
          : prize
      );
      setPrizes(updatedPrizes);
    } else {
      // 添加新奖品
      const prizeToAdd = {
        ...newPrize,
        id: Date.now()
      };
      setPrizes([...prizes, prizeToAdd]);
    }
    
    // 重置表单
    setNewPrize({
      name: '',
      level: '',
      quantity: 1
    });
  };

  // 删除奖品
  const handleRemovePrize = (id) => {
    const updatedPrizes = prizes.filter(prize => prize.id !== id);
    setPrizes(updatedPrizes);
  };

  // 更新奖品
  const handleUpdatePrize = (id, field, value) => {
    const updatedPrizes = prizes.map(prize => 
      prize.id === id 
        ? { ...prize, [field]: value }
        : prize
    );
    setPrizes(updatedPrizes);
  };

  return (
    <div className="prize-config">
      <h3>
        <FaPlus /> 奖品配置
      </h3>
      
      <div className="prize-form">
        <input
          type="text"
          placeholder="奖品名称"
          value={newPrize.name}
          onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
        />
        
        <input
          type="text"
          placeholder="奖项等级（如：一等奖、特等奖等）"
          value={newPrize.level}
          onChange={(e) => setNewPrize({ ...newPrize, level: e.target.value })}
        />
        
        <input
          type="number"
          min="1"
          placeholder="数量"
          value={newPrize.quantity}
          onChange={(e) => setNewPrize({ ...newPrize, quantity: parseInt(e.target.value) || 1 })}
        />
        
        <button onClick={handleAddPrize}>
          添加奖品
        </button>
      </div>
      
      <div className="prizes-list">
        {prizes.map(prize => (
          <div key={prize.id} className="prize-item">
            <input
              type="text"
              className="prize-level-input"
              value={prize.level}
              onChange={(e) => handleUpdatePrize(prize.id, 'level', e.target.value)}
              placeholder="奖项等级"
            />
            
            <input
              type="text"
              value={prize.name}
              onChange={(e) => handleUpdatePrize(prize.id, 'name', e.target.value)}
              placeholder="奖品名称"
            />
            
            <input
              type="number"
              min="1"
              value={prize.quantity}
              onChange={(e) => handleUpdatePrize(prize.id, 'quantity', parseInt(e.target.value) || 1)}
            />
            
            <button 
              className="remove-btn"
              onClick={() => handleRemovePrize(prize.id)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrizeConfig;