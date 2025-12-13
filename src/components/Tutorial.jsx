import React, { useState, useEffect, useRef } from 'react';

const Tutorial = ({ isVisible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialRef = useRef(null);
  
  // 教程步骤数据
  const steps = [
    {
      title: '欢迎使用智能抽奖系统🎉',
      content: '这是一个功能强大的抽奖系统，支持多种抽奖模式和个性化配置。',
      highlight: null
    },
    {
      title: '配置奖品信息🏆',
      content: '点击右上角的"配置"按钮，在奖品设置中添加或修改奖品信息。',
      highlight: '.config-button'
    },
    {
      title: '管理参与者👥',
      content: '在配置面板中，你可以导入、导出参与者名单，或生成二维码让员工自己填写信息。',
      highlight: '.participants-manager'
    },
    {
      title: '开始抽奖🎰',
      content: '点击"开始抽奖"按钮，系统会随机选择获奖者。抽奖过程支持暂停和重新开始。',
      highlight: '.lottery-section'
    },
    {
      title: '查看中奖记录📝',
      content: '在配置面板中可以查看所有中奖记录，并支持导出为Excel文件。',
      highlight: '.winner-list'
    },
    {
      title: '个性化设置⚙️',
      content: '你可以自定义首页标题，设置抽奖速度等参数，让系统更符合你的需求。',
      highlight: '.system-config'
    }
  ];

  // 处理下一步
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  // 处理上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 处理跳过
  const handleSkip = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    onClose();
  };

  // 处理完成
  const handleComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    onClose();
  };

  // 高亮当前步骤的目标元素
  useEffect(() => {
    // 移除之前的高亮
    const previousHighlight = document.querySelector('.tutorial-highlight');
    if (previousHighlight) {
      previousHighlight.classList.remove('tutorial-highlight');
    }

    // 添加新的高亮
    const currentStepData = steps[currentStep];
    if (currentStepData.highlight) {
      const highlightElement = document.querySelector(currentStepData.highlight);
      if (highlightElement) {
        highlightElement.classList.add('tutorial-highlight');
      }
    }

    // 清理函数
    return () => {
      const highlightElement = document.querySelector('.tutorial-highlight');
      if (highlightElement) {
        highlightElement.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep]);

  // 如果教程不可见，不渲染
  if (!isVisible) return null;

  return (
    <div className="tutorial-overlay" ref={tutorialRef}>
      <div className="tutorial-modal">
        <div className="tutorial-header">
          <h2>{steps[currentStep].title}</h2>
          <button className="tutorial-close-btn" onClick={handleSkip}>
            ✕
          </button>
        </div>
        
        <div className="tutorial-content">
          <p>{steps[currentStep].content}</p>
          
          <div className="tutorial-progress">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <div className="tutorial-actions">
          <button 
            className="tutorial-btn tutorial-btn-secondary"
            onClick={handleSkip}
          >
            跳过
          </button>
          
          {currentStep > 0 && (
            <button 
              className="tutorial-btn tutorial-btn-primary"
              onClick={handlePrev}
            >
              上一步
            </button>
          )}
          
          <button 
            className="tutorial-btn tutorial-btn-primary"
            onClick={handleNext}
          >
            {currentStep < steps.length - 1 ? '下一步' : '完成'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;