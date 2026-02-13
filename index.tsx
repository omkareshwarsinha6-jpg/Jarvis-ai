
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";

// --- CONSTANTS & CONFIG ---
const ACCESS_KEY = "omkareshwar";
const APPS = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', package: 'com.whatsapp' },
    { id: 'telegram', name: 'Telegram', icon: '📨', package: 'org.telegram.messenger' },
    { id: 'instagram', name: 'Instagram', icon: '📸', package: 'com.instagram.android' },
    { id: 'youtube', name: 'YouTube', icon: '📺', package: 'com.google.android.youtube' },
    { id: 'spotify', name: 'Spotify', icon: '🎵', package: 'com.spotify.music' },
    { id: 'gmail', name: 'Gmail', icon: '📧', package: 'com.google.android.gm' },
    { id: 'calendar', name: 'Calendar', icon: '📅', package: 'com.google.android.calendar' },
    { id: 'camera', name: 'Camera', icon: '📷', package: 'com.android.camera2' },
    { id: 'calculator', name: 'Calculator', icon: '➗', package: 'com.google.android.calculator' },
    { id: 'settings', name: 'Settings', icon: '⚙️', package: 'com.android.settings' }
];

// --- STATE ---
let state = {
    authenticated: false,
    name: "Boss",
    autoSpeak: true,
    currentTab: 'dashboard',
    isThinking: false,
    liveActive: false
};

// Global instance
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
let mainChat: any = null;
let audioContext: AudioContext | null = null;
let liveSession: any = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

// --- UTILS ---
function log(msg: string) {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'border-l-2 border-purple-500/20 pl-2 py-0.5 animate-fade-in';
    div.textContent = `[${time}] ${msg}`;
    const container = document.getElementById('neuralLog');
    if (container) {
        container.prepend(div);
        if (container.children.length > 50) container.lastChild?.remove();
    }
}

function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

async function playNeuralAudio(text: string) {
    if (!state.autoSpeak || state.liveActive) return;
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say warmly: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return;

        if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decode(base64Audio);
        const buffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
    } catch (e) {
        console.error("Neural TTS failed", e);
    }
}

function addMessage(sender: 'user' | 'assistant', text: string, imageUrl: string | null = null, groundingChunks: any[] = []) {
    const container = document.getElementById('chatContainer');
    if (!container) return;
    const wrapper = document.createElement('div');
    wrapper.className = `flex gap-4 ${sender === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`;
    
    const avatar = document.createElement('div');
    avatar.className = `w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs shadow-lg ${sender === 'assistant' ? 'bg-purple-gradient text-white' : 'bg-white/10'}`;
    avatar.textContent = sender === 'assistant' ? 'OM' : 'ME';

    const content = document.createElement('div');
    content.className = `message-bubble ${sender === 'user' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-white/5 border border-white/10'}`;
    
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = "rounded-2xl mb-3 w-full shadow-2xl border border-white/5";
        content.appendChild(img);
    }

    const p = document.createElement('p');
    p.className = "text-sm font-medium leading-relaxed whitespace-pre-wrap";
    p.textContent = text;
    content.appendChild(p);

    if (groundingChunks && groundingChunks.length > 0) {
        const srcList = document.createElement('div');
        srcList.className = "mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/5";
        groundingChunks.forEach(chunk => {
            if (chunk.web) {
                const link = document.createElement('a');
                link.href = chunk.web.uri;
                link.target = "_blank";
                link.className = "text-[10px] text-purple-400 font-bold hover:text-white transition-colors bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20";
                link.innerHTML = `<i class="fas fa-link mr-1"></i> ${chunk.web.title || 'Source'}`;
                srcList.appendChild(link);
            }
        });
        if (srcList.children.length > 0) content.appendChild(srcList);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;

    if (sender === 'assistant' && !imageUrl) playNeuralAudio(text);
}

// --- TOOLS ---
const openAppTool = {
    name: 'open_app',
    parameters: {
        type: Type.OBJECT,
        description: 'Open a local Android application by its package name.',
        properties: {
            package_name: { type: Type.STRING, description: 'The Android package name of the app to launch.' },
            app_name: { type: Type.STRING, description: 'The friendly name of the app.' }
        },
        required: ['package_name', 'app_name']
    }
};

// --- CORE LOGIC ---
async function processCommand(text: string) {
    if (!text.trim()) return;
    const input = document.getElementById('commandInput') as HTMLInputElement;
    if (input) input.value = '';
    
    addMessage('user', text);
    log(`Neural Input: "${text}"`);
    
    state.isThinking = true;
    const statusEl = document.getElementById('aiStatus');
    statusEl?.classList.remove('hidden');

    try {
        const ai = getAi();
        if (!mainChat) {
            mainChat = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: `You are OM AI, a premium neural bestie assistant for ${state.name}. 
                    You are cute, highly intelligent, and use emojis freely. 
                    You can open Android apps using your tools. 
                    Always provide grounded information using search when asked about facts.`,
                    tools: [{ googleSearch: {} }, { functionDeclarations: [openAppTool] }]
                }
            });
        }

        const response = await mainChat.sendMessage({ message: text });
        
        // Handle Function Calls
        if (response.functionCalls && response.functionCalls.length > 0) {
            for (const call of response.functionCalls) {
                if (call.name === 'open_app') {
                    const { package_name, app_name } = call.args as any;
                    log(`Intent triggered: ${app_name}`);
                    window.location.href = `intent://${package_name}#Intent;scheme=android-app;end`;
                    addMessage('assistant', `Manifesting ${app_name} for you, Boss! 📱✨`);
                }
            }
            return;
        }

        // Extract Grounding
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        addMessage('assistant', response.text || '', null, chunks);

    } catch (e) {
        console.error(e);
        addMessage('assistant', "Neural link glitch! Could you say that again, bestie? 🥺");
    } finally {
        state.isThinking = false;
        statusEl?.classList.add('hidden');
    }
}

async function generateImage(prompt: string) {
    log(`Painting: "${prompt}"`);
    const btn = document.getElementById('drawBtn') as HTMLButtonElement;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Painting...';
    }
    
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });

        let base64 = "";
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                base64 = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }

        if (base64) {
            addMessage('assistant', `Manifested your vision: "${prompt}"`, base64);
            const card = document.createElement('div');
            card.className = "glass p-3 rounded-[32px] border border-white/5 animate-float shadow-2xl group cursor-pointer overflow-hidden";
            card.innerHTML = `
                <img src="${base64}" class="rounded-2xl w-full aspect-square object-cover shadow-inner group-hover:scale-105 transition-transform duration-700">
                <div class="mt-3 px-1">
                    <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest">${new Date().toLocaleDateString()}</p>
                    <p class="text-[10px] font-bold text-gray-300 truncate">${prompt}</p>
                </div>
            `;
            document.getElementById('galleryGrid')?.prepend(card);
        }
    } catch (e) {
        addMessage('assistant', "Sorry, my art studio is down for maintenance! 🎨❌");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Manifest";
        }
    }
}

// --- LIVE API ---
async function startLiveMode() {
    if (state.liveActive) return;
    log("Initializing Neural Stream...");
    state.liveActive = true;
    document.getElementById('voiceOverlay')?.classList.add('active');
    
    const ai = getAi();
    const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputGain = outputAudioCtx.createGain();
    outputGain.connect(outputAudioCtx.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
            onopen: () => {
                log("Neural Stream connected.");
                const source = inputAudioCtx.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
                scriptProcessor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const l = inputData.length;
                    const int16 = new Int16Array(l);
                    for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                    const pcmBlob = {
                        data: encode(new Uint8Array(int16.buffer)),
                        mimeType: 'audio/pcm;rate=16000',
                    };
                    sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioCtx.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
                const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                    nextStartTime = Math.max(nextStartTime, outputAudioCtx.currentTime);
                    const buffer = await decodeAudioData(decode(base64Audio), outputAudioCtx, 24000, 1);
                    const source = outputAudioCtx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(outputGain);
                    source.onended = () => sources.delete(source);
                    source.start(nextStartTime);
                    nextStartTime += buffer.duration;
                    sources.add(source);
                }
                if (msg.serverContent?.interrupted) {
                    sources.forEach(s => s.stop());
                    sources.clear();
                    nextStartTime = 0;
                }
            },
            onclose: () => stopLiveMode(),
            onerror: () => stopLiveMode()
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: "You are OM AI in live mode. Be conversational, witty, and high-energy."
        }
    });

    liveSession = await sessionPromise;
}

function stopLiveMode() {
    state.liveActive = false;
    document.getElementById('voiceOverlay')?.classList.remove('active');
    if (liveSession) {
        liveSession.close();
        liveSession = null;
    }
    log("Neural Stream terminated.");
}

// --- UI & INIT ---
function renderApps() {
    const grid = document.getElementById('appsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    APPS.forEach(app => {
        const btn = document.createElement('button');
        btn.className = "glass p-6 rounded-[32px] flex flex-col items-center gap-3 hover:border-purple-500/50 transition-all border border-white/5 active:scale-95 group shadow-lg relative overflow-hidden";
        btn.innerHTML = `
            <div class="absolute inset-0 bg-purple-gradient opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <span class="text-3xl group-hover:scale-110 transition-transform duration-500">${app.icon}</span>
            <span class="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-purple-400 transition-colors">${app.name}</span>
        `;
        btn.onclick = () => {
            log(`Launching ${app.name}`);
            window.location.href = `intent://${app.package}#Intent;scheme=android-app;end`;
        };
        grid.appendChild(btn);
    });
}

function switchTab(tabId: string) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(`${tabId}Tab`)?.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('bg-purple-gradient', 'text-white', 'shadow-xl');
        b.classList.add('text-gray-400', 'hover:bg-white/5');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('bg-purple-gradient', 'text-white', 'shadow-xl');
        activeBtn.classList.remove('text-gray-400', 'hover:bg-white/5');
    }
    
    const label = document.getElementById('currentTabLabel');
    if (label) label.textContent = tabId === 'dashboard' ? 'OM AI • Core' : tabId.toUpperCase();
    
    // Toggle Back Button Visibility
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        if (tabId === 'dashboard') {
            backBtn.classList.add('hidden');
        } else {
            backBtn.classList.remove('hidden');
        }
    }

    state.currentTab = tabId;
}

function init() {
    log("Neural Link Synchronizing...");
    
    // Battery Info
    if ((navigator as any).getBattery) {
        (navigator as any).getBattery().then((b: any) => {
            const update = () => {
                const label = document.getElementById('batteryLabel');
                if (label) label.textContent = `${Math.round(b.level * 100)}%`;
            };
            update(); b.onlevelchange = update;
        });
    }
    
    const saved = localStorage.getItem('om_state_v7');
    if (saved) {
        state = { ...state, ...JSON.parse(saved) };
        const prefName = document.getElementById('prefName') as HTMLInputElement;
        const prefAutoSpeak = document.getElementById('prefAutoSpeak') as HTMLInputElement;
        if (prefName) prefName.value = state.name;
        if (prefAutoSpeak) prefAutoSpeak.checked = state.autoSpeak;
        
        const userNameLabel = document.getElementById('userNameLabel');
        const welcomeHeading = document.getElementById('welcomeHeading');
        if (userNameLabel) userNameLabel.textContent = state.name;
        if (welcomeHeading) welcomeHeading.textContent = `Welcome, ${state.name}.`;
    }

    renderApps();
    
    // Wave Animation
    const wave = document.getElementById('waveContainer');
    if (wave) {
        wave.innerHTML = '';
        for(let i=0; i<15; i++) {
            const b = document.createElement('div');
            b.className = "w-1.5 bg-purple-500 rounded-full animate-wave-bar";
            b.style.height = `${30 + Math.random() * 70}%`;
            b.style.animationDelay = `${i * 0.15}s`;
            wave.appendChild(b);
        }
    }
    log("Neural Sync Complete.");
}

// --- WINDOW EXPORTS ---
(window as any).switchTab = switchTab;
(window as any).processCommand = processCommand;

// --- DOM EVENT HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('authBtn')?.addEventListener('click', () => {
        const input = document.getElementById('authInput') as HTMLInputElement;
        if (input.value === ACCESS_KEY) {
            document.getElementById('authModal')?.classList.add('hidden');
            document.getElementById('mainApp')?.classList.remove('hidden');
            init();
        } else {
            input.classList.add('border-red-500');
            setTimeout(() => input.classList.remove('border-red-500'), 1000);
        }
    });

    document.getElementById('sendBtn')?.addEventListener('click', () => {
        const val = (document.getElementById('commandInput') as HTMLInputElement).value;
        processCommand(val);
    });

    document.getElementById('commandInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('sendBtn')?.click();
    });

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.addEventListener('click', () => switchTab((b as HTMLElement).dataset.tab || 'dashboard'));
    });

    document.getElementById('menuBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
    });

    document.getElementById('backBtn')?.addEventListener('click', () => {
        switchTab('dashboard');
    });
    
    document.getElementById('drawBtn')?.addEventListener('click', () => {
        const prompt = (document.getElementById('imageInput') as HTMLInputElement).value;
        if (prompt) generateImage(prompt);
    });

    document.getElementById('prefName')?.addEventListener('change', (e) => {
        state.name = (e.target as HTMLInputElement).value;
        localStorage.setItem('om_state_v7', JSON.stringify(state));
        const label = document.getElementById('userNameLabel');
        if (label) label.textContent = state.name;
    });

    document.getElementById('prefAutoSpeak')?.addEventListener('change', (e) => {
        state.autoSpeak = (e.target as HTMLInputElement).checked;
        localStorage.setItem('om_state_v7', JSON.stringify(state));
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('om_state_v7');
        window.location.reload();
    });

    document.getElementById('purgeBtn')?.addEventListener('click', () => {
        localStorage.removeItem('om_state_v7');
        window.location.reload();
    });

    document.getElementById('micBtn')?.addEventListener('click', () => {
        startLiveMode();
    });

    document.getElementById('stopMicBtn')?.addEventListener('click', () => {
        stopLiveMode();
    });

    document.getElementById('stopVoiceBtn')?.addEventListener('click', () => {
        if (audioContext) {
            audioContext.close().then(() => audioContext = null);
            log("Audio Output Muted.");
        }
    });

    // Dashboard Quick Actions
    document.getElementById('jokeBtn')?.addEventListener('click', () => processCommand('Tell me a hilarious joke'));
    document.getElementById('weatherBtn')?.addEventListener('click', () => processCommand('Give me a detailed weather update for my location'));
    document.getElementById('newsBtn')?.addEventListener('click', () => processCommand('What are the top global news stories right now?'));
    document.getElementById('artBtn')?.addEventListener('click', () => switchTab('images'));
});
