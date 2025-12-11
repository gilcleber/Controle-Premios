
import React, { useState, useEffect, useRef } from 'react';
import { Prize, PrizeOutput, TabView, UserRole } from './types';
import { PrizeList } from './components/PrizeList';
import { PrizeForm } from './components/PrizeForm';
import { WinnerList } from './components/WinnerList';
import { LayoutDashboard, Gift, Users, Plus, Radio, ClipboardList, LogOut, Copy, X, Save, History, AlertTriangle, UserCog, Shield, User, Share2, Lock, Link as LinkIcon, Download, Upload, Database, FileUp, CheckCircle, Cloud, RefreshCw, Search, Key, Globe, ExternalLink, Trophy, PackagePlus, Zap } from 'lucide-react';

const App: React.FC = () => {
  // --- Auth State ---
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // --- Data State ---
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [outputs, setOutputs] = useState<PrizeOutput[]>([]);
  const [activeTab, setActiveTab] = useState<TabView>('DASHBOARD');
  
  // --- UI State ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formIsQuickDraw, setFormIsQuickDraw] = useState(false); // New state to control if form is for quick draw
  const [editingPrize, setEditingPrize] = useState<Prize | undefined>(undefined);
  
  // Output/Exit Modal State
  const [outputModalOpen, setOutputModalOpen] = useState(false);
  const [selectedPrizeForOutput, setSelectedPrizeForOutput] = useState<Prize | null>(null);
  const [outputQuantity, setOutputQuantity] = useState(1);
  const [outputNote, setOutputNote] = useState('');
  
  // Winner Fields State
  const [winnerName, setWinnerName] = useState('');
  const [winnerPhone, setWinnerPhone] = useState('');
  const [winnerEmail, setWinnerEmail] = useState('');
  const [winnerDoc, setWinnerDoc] = useState('');
  const [winnerAddress, setWinnerAddress] = useState('');
  const [winnerHistory, setWinnerHistory] = useState<PrizeOutput[]>([]);

  // Edit Output State
  const [editingOutput, setEditingOutput] = useState<PrizeOutput | null>(null);

  // Script Modal State
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Cloud / Sync State
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [cloudConfig, setCloudConfig] = useState({ binId: '', apiKey: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Import/Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loginFileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization & Persistence ---
  useEffect(() => {
    // 1. Load Data
    const savedPrizes = localStorage.getItem('radio_prizes');
    const savedOutputs = localStorage.getItem('radio_outputs');
    const savedCloud = localStorage.getItem('radio_cloud_config');
    const savedLastSync = localStorage.getItem('radio_last_sync');

    if (savedPrizes) setPrizes(JSON.parse(savedPrizes));
    if (savedOutputs) setOutputs(JSON.parse(savedOutputs));
    if (savedCloud) setCloudConfig(JSON.parse(savedCloud));
    if (savedLastSync) setLastSync(savedLastSync);

    // 2. Check URL for Magic Links
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    
    if (roleParam === 'OPERATOR') {
      setUserRole('OPERATOR');
      setActiveTab('INVENTORY');
    } else if (roleParam === 'RECEPTION') {
      setUserRole('RECEPTION');
      setActiveTab('OUTPUTS');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('radio_prizes', JSON.stringify(prizes));
    localStorage.setItem('radio_outputs', JSON.stringify(outputs));
  }, [prizes, outputs]);

  // History Check Logic
  useEffect(() => {
    if (winnerName.length > 3) {
      const history = outputs.filter(o => 
        o.winnerName.toLowerCase().includes(winnerName.toLowerCase())
      );
      setWinnerHistory(history);
    } else {
      setWinnerHistory([]);
    }
  }, [winnerName, outputs]);

  // --- Logic Helpers ---

  const addBusinessDays = (startDate: Date, days: number): Date => {
    const result = new Date(startDate);
    let count = 0;
    while (count < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
    }
    return result;
  };

  const getShareLink = (role: string) => {
    return `${window.location.origin}${window.location.pathname}?role=${role}`;
  };

  const filteredOutputs = outputs.filter(output => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      output.winnerName?.toLowerCase().includes(q) ||
      output.prizeName?.toLowerCase().includes(q) ||
      output.note?.toLowerCase().includes(q) ||
      output.date?.includes(q) ||
      output.winnerDoc?.includes(q)
    );
  });

  // --- Cloud Sync Functions (JSONBin) ---
  
  const saveCloudConfig = () => {
    localStorage.setItem('radio_cloud_config', JSON.stringify(cloudConfig));
    alert('Configuração da Nuvem Salva! Agora você pode sincronizar os dados.');
  };

  const handleCloudUpload = async () => {
    if (!cloudConfig.binId || !cloudConfig.apiKey) {
      alert('Configure a nuvem primeiro!');
      return;
    }
    setIsSyncing(true);
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${cloudConfig.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': cloudConfig.apiKey
        },
        body: JSON.stringify({ prizes, outputs, lastUpdate: new Date().toISOString() })
      });
      
      if (response.ok) {
        const now = new Date().toLocaleString();
        setLastSync(now);
        localStorage.setItem('radio_last_sync', now);
        alert('Dados enviados para a nuvem com sucesso!');
        setCloudModalOpen(false);
      } else {
        throw new Error('Falha no envio');
      }
    } catch (error) {
      alert('Erro ao enviar dados. Verifique se o Bin ID e a API Key estão corretos.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudDownload = async () => {
    if (!cloudConfig.binId || !cloudConfig.apiKey) {
      alert('Nuvem não configurada. Peça ao administrador.');
      return;
    }
    setIsSyncing(true);
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${cloudConfig.binId}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': cloudConfig.apiKey
        }
      });

      if (response.ok) {
        const json = await response.json();
        const data = json.record;
        
        if (data.prizes || data.outputs) {
           setPrizes(data.prizes || []);
           setOutputs(data.outputs || []);
           const now = new Date().toLocaleString();
           setLastSync(now);
           localStorage.setItem('radio_last_sync', now);
           alert('Dados atualizados da nuvem com sucesso!');
           setCloudModalOpen(false);
        } else {
           if (Object.keys(data).length === 0) {
             alert('O Bin da nuvem está vazio. Faça o primeiro envio (Upload) para começar.');
           } else {
             alert('Formato de dados desconhecido na nuvem.');
           }
        }
      } else {
        throw new Error('Falha no download');
      }
    } catch (error) {
      alert('Erro ao baixar dados. Verifique a configuração.');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Handlers ---

  const handleAdminLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '0000') {
      setUserRole('ADMIN');
      setActiveTab('DASHBOARD');
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleSavePrize = (prize: Prize) => {
    if (userRole !== 'ADMIN') return;

    if (editingPrize) {
      setPrizes(prev => prev.map(p => p.id === prize.id ? prize : p));
    } else {
      setPrizes(prev => [...prev, prize]);
    }
    setIsFormOpen(false);
    setEditingPrize(undefined);
    setFormIsQuickDraw(false);
  };

  const handleDeletePrize = (id: string) => {
    if (userRole !== 'ADMIN') return;
    if (confirm('Tem certeza que deseja excluir este prêmio?')) {
      setPrizes(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEditPrize = (prize: Prize) => {
    if (userRole !== 'ADMIN') return;
    setEditingPrize(prize);
    setFormIsQuickDraw(false);
    setIsFormOpen(true);
  };

  const handleToggleOnAir = (prize: Prize) => {
    if (userRole !== 'ADMIN') return;
    setPrizes(prev => prev.map(p => p.id === prize.id ? { ...p, isOnAir: !p.isOnAir } : p));
  };

  // Output / Baixa Logic
  const openOutputModal = (prize: Prize) => {
    setSelectedPrizeForOutput(prize);
    setOutputQuantity(1);
    setOutputNote('');
    setWinnerName('');
    setWinnerPhone('');
    setWinnerEmail('');
    setWinnerDoc('');
    setWinnerAddress('');
    setOutputModalOpen(true);
  };

  const handleRegisterOutput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrizeForOutput) return;
    // Operator and Admin can register outputs
    if (userRole === 'RECEPTION') return;

    if (outputQuantity > selectedPrizeForOutput.availableQuantity) {
      alert("Quantidade de saída maior que a disponível!");
      return;
    }

    if (!winnerName) {
      alert("Por favor, informe o nome do ganhador.");
      return;
    }

    const today = new Date();
    const deadlineDate = addBusinessDays(today, selectedPrizeForOutput.pickupDeadlineDays);

    const newOutput: PrizeOutput = {
      id: crypto.randomUUID(),
      prizeId: selectedPrizeForOutput.id,
      prizeName: selectedPrizeForOutput.name,
      quantity: outputQuantity,
      note: outputNote || 'Saída Avulsa',
      date: today.toISOString(),
      pickupDeadline: deadlineDate.toISOString(),
      status: 'PENDING',
      winnerName,
      winnerPhone,
      winnerEmail,
      winnerDoc,
      winnerAddress,
    };

    // Decrement inventory
    setPrizes(prev => prev.map(p => {
      if (p.id === selectedPrizeForOutput.id) {
        return { ...p, availableQuantity: p.availableQuantity - outputQuantity };
      }
      return p;
    }));

    setOutputs(prev => [newOutput, ...prev]);
    setOutputModalOpen(false);
    setSelectedPrizeForOutput(null);
    // If Operator, stay on inventory/cards. If Admin, go to outputs.
    if (userRole === 'ADMIN') setActiveTab('OUTPUTS'); 
  };

  const handleConfirmPickup = (outputId: string) => {
    if (userRole === 'OPERATOR') return;

    if (confirm('Confirmar entrega/retirada destes itens?')) {
      setOutputs(prev => prev.map(o => {
        if (o.id === outputId) {
          return {
            ...o,
            status: 'DELIVERED',
            deliveredDate: new Date().toISOString()
          };
        }
        return o;
      }));
    }
  };

  const handleDeleteOutput = (outputId: string) => {
    if (userRole !== 'ADMIN') return;

    const output = outputs.find(o => o.id === outputId);
    if (!output) return;

    if (confirm(`Excluir saída de "${output.prizeName}" e devolver ${output.quantity} itens ao estoque?`)) {
      // Return stock
      setPrizes(prev => prev.map(p => {
        if (p.id === output.prizeId) {
          return { ...p, availableQuantity: p.availableQuantity + output.quantity };
        }
        return p;
      }));
      // Delete Output
      setOutputs(prev => prev.filter(o => o.id !== outputId));
    }
  };

  const handleEditOutput = (output: PrizeOutput) => {
    if (userRole !== 'ADMIN') return;
    setEditingOutput({ ...output });
  };

  const handleSaveOutputEdit = () => {
    if (!editingOutput) return;
    setOutputs(prev => prev.map(o => o.id === editingOutput.id ? editingOutput : o));
    setEditingOutput(null);
  };

  // Script Generator
  const handleGenerateScript = (prize: Prize) => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const pickupDate = addBusinessDays(today, prize.pickupDeadlineDays);
    const pickupDateStr = pickupDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    const script = `${todayStr}\nE HOJE AQUI NO ESPORTE EM DEBATE VOCÊ QUE PARTICIPA PELO YOUTUBE PODE GANHAR PREMIOS.\n*${prize.name.toUpperCase()}*\nE PARA PARTICIPAR ENTRE AGORA NA TRANSMISSÃO DO YOUTUBE DA RÁDIOBANDEIRANTES CAMPINAS PREENCHA O FORMULÁRIO QUE ESTA FIXADO NOS COMENTARIOS OU ACESSE NOSSO SITE\nWWW.RADIOBANDEIRANTESCAMPINAS.COM.BR / VA ATE PROMOÇÕES E PREENCHA O FORMULARIO E BOA SORTE. VAMOS DIVULGAR O GANHADOR NO FINAL DO PROGRAMA\nE SE VOCÊ NÃO TIVER COMO BUSCAR O PREMIO, ENTÃO NEM PARTICIPE, DEIXE PARA OUTRA PESSOA, POIS, A RETIRADA É OBRIGATÓRIA DA PESSOA SORTEADA.\nRETIRADA ATÉ DIA ${pickupDateStr}`;
    
    setGeneratedScript(script);
    setScriptModalOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    alert('Texto copiado!');
  };

  // --- Backup Functions ---
  const handleDownloadBackup = () => {
    const data = {
      prizes,
      outputs,
      backupDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>, isLoginScreen: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isLoginScreen && !confirm('ATENÇÃO: Isso irá substituir TODOS os dados atuais pelos dados do backup. Deseja continuar?')) {
      e.target.value = ''; // Reset file input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.prizes || json.outputs) {
          setPrizes(json.prizes || []);
          setOutputs(json.outputs || []);
          alert('Dados carregados com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  // Stats
  const totalItems = prizes.reduce((acc, curr) => acc + curr.totalQuantity, 0);
  const totalAvailable = prizes.reduce((acc, curr) => acc + curr.availableQuantity, 0);
  const pendingPickups = outputs.filter(w => w.status === 'PENDING').length;

  // --- Login Screen ---
  if (!userRole) {
    const hasData = prizes.length > 0 || outputs.length > 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
          <div className="bg-blue-600 p-8 md:w-2/5 flex flex-col justify-center items-center text-white text-center">
            <div className="bg-white/20 p-4 rounded-full mb-6">
              <Radio size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-2">RadioPrize</h1>
            <p className="opacity-80">Sistema de Controle de Prêmios e Promoções</p>
            
            {cloudConfig.apiKey && cloudConfig.binId && (
              <button
                onClick={handleCloudDownload}
                className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={16}/> : <Cloud size={16}/>}
                Atualizar da Nuvem
              </button>
            )}

            {!hasData && (
              <div className="mt-8 p-4 bg-blue-700/50 rounded-lg border border-blue-400/30 w-full">
                <p className="text-sm font-bold mb-2 flex items-center justify-center gap-2">
                  <Database size={16} /> Banco de Dados Vazio
                </p>
                <p className="text-xs opacity-80 mb-3">
                  Se você recebeu o arquivo de dados do administrador, carregue-o aqui.
                </p>
                <label className="bg-white text-blue-700 px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-blue-50 transition-colors w-full flex items-center justify-center gap-2">
                  <Upload size={14} /> Carregar Dados
                  <input 
                    type="file" 
                    ref={loginFileInputRef}
                    onChange={(e) => handleRestoreBackup(e, true)}
                    accept=".json" 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="p-8 md:w-3/5 relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {showAdminLogin ? 'Área Administrativa' : 'Quem é você?'}
            </h2>
            
            {!showAdminLogin ? (
              <div className="space-y-4">
                <button 
                  onClick={() => setShowAdminLogin(true)}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-4 group"
                >
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Shield size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">Administrador</div>
                    <div className="text-sm text-gray-500">Acesso total (Requer Senha)</div>
                  </div>
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">Links de Acesso</span>
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                   Para acessar como <strong>Locutor</strong> ou <strong>Recepção</strong>, utilize o link compartilhado pelo administrador ou carregue os dados ao lado se for seu primeiro acesso.
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminLoginAttempt} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha de Acesso</label>
                  <div className="relative">
                    <input 
                      type="password"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="••••"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                    />
                    <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">Dica: A senha padrão é 0000</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setShowAdminLogin(false); setAdminPassword(''); }}
                    className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
             <Radio size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">RadioPrize</h1>
            <p className="text-xs text-slate-400">
              {userRole === 'ADMIN' && 'Administrador'}
              {userRole === 'OPERATOR' && 'Operador / No Ar'}
              {userRole === 'RECEPTION' && 'Recepção'}
            </p>
          </div>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          {/* Admin Menu */}
          {userRole === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <LayoutDashboard size={20} /> Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('INVENTORY')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'INVENTORY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Gift size={20} /> Estoque Prêmios
              </button>
              <button
                onClick={() => setActiveTab('OUTPUTS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'OUTPUTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <ClipboardList size={20} /> Saídas / Histórico
              </button>
              
              <div className="pt-4 mt-4 border-t border-slate-800">
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-teal-400 hover:bg-teal-900/20 transition-colors"
                >
                  <Share2 size={20} /> Compartilhar
                </button>
              </div>
            </>
          )}

          {/* Operator Menu (Simplified) */}
          {userRole === 'OPERATOR' && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
               <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Modo No Ar</h3>
               <p className="text-sm text-slate-300">
                 Visualize apenas os prêmios liberados para sorteio.
               </p>
            </div>
          )}

          {/* Reception Menu (Simplified) */}
          {userRole === 'RECEPTION' && (
             <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
               <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Modo Recepção</h3>
               <p className="text-sm text-slate-300">
                 Confira os dados e confirme a entrega dos prêmios.
               </p>
            </div>
          )}

          <div className="mt-auto">
             <button
                onClick={() => userRole === 'ADMIN' ? setCloudModalOpen(true) : handleCloudDownload()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-300 transition-colors mb-2"
                title={lastSync ? `Última atualização: ${lastSync}` : 'Sincronizar dados'}
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <Cloud size={20} />}
                {userRole === 'ADMIN' ? 'Nuvem / Sync' : 'Atualizar Dados'}
              </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} /> Sair
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
           <div>
             <h2 className="text-2xl font-bold text-gray-800">
               {userRole === 'OPERATOR' ? 'Prêmios no Ar' : 
                 (activeTab === 'DASHBOARD' ? 'Visão Geral' : 
                  activeTab === 'INVENTORY' ? 'Controle de Estoque' : 
                  userRole === 'RECEPTION' ? 'Retirada de Prêmios' : 'Histórico de Saídas')}
             </h2>
             <p className="text-gray-500 text-sm">
               {userRole === 'OPERATOR' 
                 ? 'Itens disponíveis para sorteio imediato.' 
                 : (activeTab === 'OUTPUTS' && userRole === 'RECEPTION' 
                    ? 'Confirme a identidade do ouvinte antes de entregar.' 
                    : 'Gerencie o fluxo de prêmios da emissora.')}
             </p>
           </div>
           
           {activeTab === 'INVENTORY' && userRole === 'ADMIN' && (
             <div className="flex gap-2">
                <button
                 onClick={() => { setEditingPrize(undefined); setFormIsQuickDraw(true); setIsFormOpen(true); }}
                 className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all font-semibold"
               >
                 <Zap size={18} /> Sorteio Rápido (Já no Ar)
               </button>
               <button
                 onClick={() => { setEditingPrize(undefined); setFormIsQuickDraw(false); setIsFormOpen(true); }}
                 className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 transition-all font-semibold"
               >
                 <PackagePlus size={18} /> Cadastrar Estoque
               </button>
             </div>
           )}
        </header>

        {/* ... (Existing Dashboard Code) ... */}
        {activeTab === 'DASHBOARD' && userRole === 'ADMIN' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Itens em Estoque</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalAvailable}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Gift size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aguardando Retirada</p>
                    <h3 className="text-3xl font-bold text-orange-600 mt-2">{pendingPickups}</h3>
                  </div>
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Saídas</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-2">{outputs.length}</h3>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                    <LogOut size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Tools: Backup and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                   <AlertTriangle size={18} className="text-orange-500" /> Próximos a Vencer
                 </h3>
                 {prizes.filter(p => p.availableQuantity > 0).sort((a,b) => new Date(a.maxDrawDate).getTime() - new Date(b.maxDrawDate).getTime()).slice(0,5).map(p => (
                   <div key={p.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                     <div>
                       <div className="font-medium text-sm text-gray-800">{p.name}</div>
                       <div className="text-xs text-gray-500">Vence: {new Date(p.maxDrawDate).toLocaleDateString()}</div>
                     </div>
                     <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{p.availableQuantity} un</span>
                   </div>
                 ))}
                 {prizes.filter(p => p.availableQuantity > 0).length === 0 && (
                   <p className="text-sm text-gray-400 italic">Nenhum prêmio próximo do vencimento.</p>
                 )}
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                   <Database size={18} className="text-indigo-500" /> Gestão de Dados Local
                 </h3>
                 <p className="text-sm text-gray-500 mb-4">
                   Este sistema roda no navegador. Use estas opções para transferir dados ou salvar cópias de segurança.
                 </p>
                 <div className="flex gap-4">
                   <button 
                     onClick={handleDownloadBackup}
                     className="flex-1 flex flex-col items-center justify-center p-4 border border-indigo-100 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-700 gap-2"
                   >
                     <Download size={24} />
                     <span className="font-bold text-sm">Baixar Backup</span>
                   </button>
                   
                   <label className="flex-1 flex flex-col items-center justify-center p-4 border border-green-100 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-green-700 gap-2 cursor-pointer">
                     <Upload size={24} />
                     <span className="font-bold text-sm">Carregar Dados</span>
                     <input 
                       type="file" 
                       ref={fileInputRef}
                       onChange={handleRestoreBackup}
                       accept=".json" 
                       className="hidden" 
                     />
                   </label>
                 </div>
               </div>
            </div>
          </div>
        )}

        {(activeTab === 'INVENTORY' || userRole === 'OPERATOR') && (
          <PrizeList 
            prizes={prizes} 
            role={userRole}
            onDelete={handleDeletePrize} 
            onEdit={handleEditPrize} 
            onDraw={openOutputModal}
            onGenerateScript={handleGenerateScript}
            onToggleOnAir={handleToggleOnAir}
          />
        )}

        {/* ... (Existing Output List) ... */}
        {(activeTab === 'OUTPUTS' || userRole === 'RECEPTION') && (
          <div>
            <div className="mb-4 flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm max-w-md">
              <Search size={20} className="text-gray-400 ml-2" />
              <input 
                type="text"
                placeholder="Buscar por ganhador, prêmio ou data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={16} />
                </button>
              )}
            </div>

            <WinnerList 
              winners={filteredOutputs} 
              role={userRole}
              onConfirmPickup={handleConfirmPickup} 
              onEdit={handleEditOutput}
              onDelete={handleDeleteOutput}
            />
          </div>
        )}
      </main>

      {/* Prize Form Modal (Admin Only) */}
      {isFormOpen && userRole === 'ADMIN' && (
        <PrizeForm
          initialData={editingPrize}
          onSave={handleSavePrize}
          onCancel={() => { setIsFormOpen(false); setEditingPrize(undefined); }}
          forceOnAir={formIsQuickDraw}
        />
      )}

      {/* Cloud Config & Sync Modal (Admin) */}
      {cloudModalOpen && userRole === 'ADMIN' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Cloud size={20} className="text-indigo-600"/> Sincronização na Nuvem</h3>
               <button onClick={() => setCloudModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-800 space-y-2">
                <p className="font-bold flex items-center gap-2"><ExternalLink size={14}/> Como configurar (Passo a Passo):</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>No site JSONBin, clique em <strong>API KEYS</strong> no menu lateral e copie a chave Mestra.</li>
                  <li>Clique em <strong>BINS</strong>, crie um novo. No editor, apague tudo e cole: <code>{`{"prizes": [], "outputs": []}`}</code> e clique em <strong>Save Bin</strong>.</li>
                  <li>Copie o código <strong>Bin ID</strong> gerado no topo da página.</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Master API Key (X-Master-Key)</label>
                <div className="flex gap-2">
                   <Key size={16} className="text-gray-400 mt-2"/>
                   <input 
                    type="password" 
                    value={cloudConfig.apiKey}
                    onChange={e => setCloudConfig(prev => ({...prev, apiKey: e.target.value}))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Sua chave API do JSONBin"
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bin ID</label>
                <div className="flex gap-2">
                   <Globe size={16} className="text-gray-400 mt-2"/>
                   <input 
                    type="text" 
                    value={cloudConfig.binId}
                    onChange={e => setCloudConfig(prev => ({...prev, binId: e.target.value}))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="ID do seu Bin (Ex: 673b...)"
                   />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button onClick={saveCloudConfig} className="text-xs text-indigo-600 font-bold hover:underline">Salvar Configuração</button>
              </div>

              <hr className="border-gray-100" />
              
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={handleCloudUpload}
                   disabled={isSyncing || !cloudConfig.binId}
                   className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50"
                 >
                   {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />} Enviar Dados
                 </button>
                 <button 
                   onClick={handleCloudDownload}
                   disabled={isSyncing || !cloudConfig.binId}
                   className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
                 >
                   {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />} Baixar Dados
                 </button>
              </div>
              
              {lastSync && (
                <p className="text-center text-xs text-gray-400 mt-2">Última sincronização: {lastSync}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Output Modal (Operator & Admin) */}
      {outputModalOpen && selectedPrizeForOutput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
             <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Trophy size={20} className="text-indigo-600"/> Registrar Ganhador</h3>
               <p className="text-sm text-gray-600 mt-1">
                 Prêmio: <span className="font-bold text-blue-600">{selectedPrizeForOutput.name}</span>
               </p>
             </div>
             <form onSubmit={handleRegisterOutput} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd</label>
                    <input 
                      type="number"
                      min="1"
                      max={selectedPrizeForOutput.availableQuantity}
                      required 
                      value={outputQuantity}
                      onChange={e => setOutputQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Evento / Programa</label>
                    <input 
                      type="text" 
                      value={outputNote}
                      onChange={e => setOutputNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      placeholder="Ex: Esporte em Debate"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Ganhador *</label>
                  <input 
                    type="text" 
                    required
                    value={winnerName}
                    onChange={e => setWinnerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none font-medium"
                    placeholder="Nome completo do ouvinte"
                    autoComplete="off"
                  />
                  
                  {/* History Alert */}
                  {winnerHistory.length > 0 && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase mb-2">
                        <History size={14} /> Histórico Encontrado ({winnerHistory.length})
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {winnerHistory.map(h => (
                          <div key={h.id} className="text-xs text-amber-900 flex justify-between border-b border-amber-100 pb-1 last:border-0">
                            <span>{new Date(h.date).toLocaleDateString()} - {h.prizeName}</span>
                            <span className="opacity-70">{h.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                    <input 
                      type="tel" 
                      value={winnerPhone}
                      onChange={e => setWinnerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      placeholder="(XX) 9XXXX-XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF / RG</label>
                    <input 
                      type="text" 
                      value={winnerDoc}
                      onChange={e => setWinnerDoc(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input 
                      type="email" 
                      value={winnerEmail}
                      onChange={e => setWinnerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço</label>
                    <input 
                      type="text" 
                      value={winnerAddress}
                      onChange={e => setWinnerAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>

                <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="block font-bold">Prazo de Retirada:</span>
                    {addBusinessDays(new Date(), selectedPrizeForOutput.pickupDeadlineDays).toLocaleDateString()} ({selectedPrizeForOutput.pickupDeadlineDays} dias úteis)
                  </div>
                  <AlertTriangle size={16} className="opacity-50"/>
                </div>

                <div className="flex gap-3 pt-4">
                   <button 
                     type="button"
                     onClick={() => setOutputModalOpen(false)}
                     className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                   >
                     Cancelar
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 flex justify-center items-center gap-2 font-bold shadow-lg shadow-green-200"
                   >
                     <Trophy size={18} /> Confirmar
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Share/Backup Modal ... (Existing Code) */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Share2 size={20} className="text-teal-600"/> Compartilhar Acesso e Dados</h3>
               <button onClick={() => setShareModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Database size={16} /> Como funciona o envio?
                  </h4>
                  <p className="text-sm text-blue-700">
                    O sistema funciona localmente no seu navegador. Para sincronizar com outras máquinas:
                  </p>
                  <ul className="list-disc list-inside text-sm text-blue-700 mt-2 font-medium">
                    <li>Opção A: Use o botão <strong>Nuvem / Sync</strong> (Configuração única).</li>
                    <li>Opção B: Baixe o arquivo de backup abaixo e envie por WhatsApp.</li>
                  </ul>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Lado Esquerdo: Links */}
                 <div className="space-y-4">
                   <h5 className="font-bold text-gray-700 text-sm uppercase border-b pb-2">1. Copie o Link</h5>
                   
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Locutor / Operador</label>
                     <div className="flex gap-2">
                       <input type="text" readOnly value={getShareLink('OPERATOR')} className="flex-1 bg-gray-50 border border-gray-200 p-2 rounded text-xs text-gray-600" />
                       <button onClick={() => { navigator.clipboard.writeText(getShareLink('OPERATOR')); alert('Link Copiado!'); }} className="bg-indigo-100 text-indigo-700 px-3 rounded hover:bg-indigo-200"><Copy size={16}/></button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recepção</label>
                     <div className="flex gap-2">
                       <input type="text" readOnly value={getShareLink('RECEPTION')} className="flex-1 bg-gray-50 border border-gray-200 p-2 rounded text-xs text-gray-600" />
                       <button onClick={() => { navigator.clipboard.writeText(getShareLink('RECEPTION')); alert('Link Copiado!'); }} className="bg-green-100 text-green-700 px-3 rounded hover:bg-green-200"><Copy size={16}/></button>
                     </div>
                   </div>
                 </div>

                 {/* Lado Direito: Dados */}
                 <div className="space-y-4">
                   <h5 className="font-bold text-gray-700 text-sm uppercase border-b pb-2">2. Envie os Dados (Opção B)</h5>
                   
                   <button 
                     onClick={handleDownloadBackup}
                     className="w-full flex items-center justify-center gap-2 p-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border border-gray-300 transition-colors"
                   >
                     <Download size={20} />
                     <div className="text-left">
                       <div className="font-bold text-sm">Baixar Arquivo de Dados</div>
                       <div className="text-xs text-gray-500">radio-backup.json</div>
                     </div>
                   </button>
                 </div>
               </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100 text-center">
              <button onClick={() => setShareModalOpen(false)} className="text-sm font-bold text-gray-500 hover:text-gray-800">Fechar Janela</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
