
// speech_listening_helper/frontend/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // 语言练习文本库
    const practiceTexts = {
        en: [
            "The quick brown fox jumps over the lazy dog.",
            "To be or not to be, that is the question.",
            "All that glitters is not gold.",
            "Practice makes perfect."
        ],
        ja: [
            "早起きは三文の徳",
            "猿も木から落ちる",
            "石の上にも三年",
            "花より団子"
        ],
        ko: [
            "가는 말이 고와야 오는 말이 곱다",
            "원숭이도 나무에서 떨어진다",
            "천리 길도 한 걸음부터",
            "호랑이도 제 말 하면 온다"
        ],
        fr: [
            "Petit à petit, l'oiseau fait son nid.",
            "Qui vivra verra.",
            "L'habit ne fait pas le moine.",
            "Après la pluie, le beau temps."
        ]
    };

    // DOM元素
    const recordBtn = document.getElementById('record-btn');
    const recordIcon = document.getElementById('record-icon');
    const recordStatus = document.getElementById('record-status');
    const practiceText = document.getElementById('practice-text');
    const newTextBtn = document.getElementById('new-text-btn');
    const playbackSection = document.getElementById('playback-section');
    const playbackAudio = document.getElementById('playback-audio');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultSection = document.getElementById('result-section');
    const langBtns = document.querySelectorAll('.lang-btn');
    
    // 状态变量
    let mediaRecorder;
    let audioChunks = [];
    let currentLang = 'en';
    let currentText = '';
    let isRecording = false;
    
    // 初始化
    initPracticeText();
    
    // 事件监听
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            initPracticeText();
            resetUI();
        });
    });
    
    newTextBtn.addEventListener('click', () => {
        initPracticeText();
        resetUI();
    });
    
    recordBtn.addEventListener('click', toggleRecording);
    analyzeBtn.addEventListener('click', analyzePronunciation);
    
    // 函数定义
    function initPracticeText() {
        const texts = practiceTexts[currentLang];
        currentText = texts[Math.floor(Math.random() * texts.length)];
        practiceText.textContent = currentText;
    }
    
    function resetUI() {
        playbackSection.style.display = 'none';
        resultSection.style.display = 'none';
        recordStatus.textContent = '准备录音';
        recordIcon.textContent = '🎤';
        recordBtn.classList.remove('recording');
    }
    
    async function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            await startRecording();
        }
    }
    
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (e) => {
                audioChunks.push(e.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                playbackAudio.src = audioUrl;
                playbackSection.style.display = 'block';
                saveRecordingHistory(audioUrl);
            };
            
            mediaRecorder.start();
            isRecording = true;
            recordIcon.textContent = '⏹';
            recordStatus.textContent = '录音中...';
            recordBtn.classList.add('recording');
        } catch (err) {
            console.error('录音失败:', err);
            alert('无法访问麦克风，请检查权限设置');
        }
    }
    
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            isRecording = false;
            recordStatus.textContent = '录音完成';
            recordBtn.classList.remove('recording');
            
            // 停止所有音轨
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }
    
    function analyzePronunciation() {
        // 模拟AI分析结果
        const score = Math.floor(Math.random() * 30) + 70; // 70-100之间的随机分数
        const fluency = Math.floor(Math.random() * 20) + 80;
        const pronunciation = Math.floor(Math.random() * 20) + 80;
        
        document.getElementById('score').textContent = score;
        document.getElementById('fluency').textContent = fluency;
        document.getElementById('pronunciation').textContent = pronunciation;
        
        // 生成改进建议
        const suggestions = [
            "注意元音的发音长度",
            "句子结尾语调需要更明显",
            "单词之间的连读需要加强",
            "部分辅音发音不够清晰"
        ];
        
        const suggestionsList = document.getElementById('suggestions');
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });
        
        resultSection.style.display = 'block';
        saveAnalysisResult(score, fluency, pronunciation);
    }
    
    function saveRecordingHistory(audioUrl) {
        const history = JSON.parse(localStorage.getItem('recordingHistory') || '[]');
        history.unshift({
            lang: currentLang,
            text: currentText,
            audioUrl: audioUrl,
            timestamp: new Date().toISOString()
        });
        
        // 只保留最近的10条记录
        localStorage.setItem('recordingHistory', JSON.stringify(history.slice(0, 10)));
    }
    
    function saveAnalysisResult(score, fluency, pronunciation) {
        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        history.unshift({
            lang: currentLang,
            text: currentText,
            score: score,
            fluency: fluency,
            pronunciation: pronunciation,
            timestamp: new Date().toISOString()
        });
        
        // 只保留最近的10条记录
        localStorage.setItem('analysisHistory', JSON.stringify(history.slice(0, 10)));
    }
    
    // 语音合成朗读示例文本
    function speakText() {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentText);
            utterance.lang = currentLang === 'en' ? 'en-US' : 
                            currentLang === 'ja' ? 'ja-JP' :
                            currentLang === 'ko' ? 'ko-KR' : 'fr-FR';
            speechSynthesis.speak(utterance);
        } else {
            alert('您的浏览器不支持语音合成功能');
        }
    }
});
