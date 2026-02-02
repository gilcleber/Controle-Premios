import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Refresh timestamp: 2026-02-02 01:58
import { supabase } from './services/supabase';
import { Prize, PrizeOutput, TabView, UserRole, Program, OutputType, MasterInventory, MasterInventoryPhoto, RadioStation } from './types';
import { PrizeList } from './components/PrizeList';
import { PrizeForm } from './components/PrizeForm';
import { WinnerList } from './components/WinnerList';
import { MasterInventoryList } from './components/MasterInventoryList';
import { MasterItemForm } from './components/MasterItemForm';
import { DistributionModal } from './components/DistributionModal';
import { PhotoUpload } from './components/PhotoUpload';
import { StationSelector } from './components/StationSelector';
import { Dashboard } from './components/Dashboard';
import { ManageStationsModal } from './components/ManageStationsModal';
import { RadioManagement } from './components/RadioManagement';
import { RadioLoginPage } from './components/RadioLoginPage';
import { PerformanceModal } from './components/PerformanceModal';
import { CreateRadioModal } from './components/CreateRadioModal';
import { SortlyInventory } from './components/SortlyInventory';
import { getItemPhotos } from './services/photoUpload';
import { LayoutDashboard, Gift, Users, Radio, ClipboardList, LogOut, X, History, AlertTriangle, Shield, Share2, Lock, RefreshCw, Search, Trophy, PackagePlus, Zap, Copy, ExternalLink, FileText, Database, Settings, Mic2, Gift as GiftIcon, Plus, Warehouse, Edit2 } from 'lucide-react';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';

const App: React.FC = () => {
  // --- Auth State ---
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // --- Data State ---
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [outputs, setOutputs] = useState<PrizeOutput[]>([]);
  const [activeTab, setActiveTab] = useState<TabView>('DASHBOARD');
  const [receptionTab, setReceptionTab] = useState<'PENDING' | 'DELIVERED' | 'EXPIRED'>('PENDING');

  // --- UI State ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formIsQuickDraw, setFormIsQuickDraw] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | undefined>(undefined);

  // Output/Exit Modal State
  const [outputModalOpen, setOutputModalOpen] = useState(false);
  const [selectedPrizeForOutput, setSelectedPrizeForOutput] = useState<Prize | null>(null);
  const [outputQuantity, setOutputQuantity] = useState(1);
  const [outputNote, setOutputNote] = useState('');
  const [outputProgramId, setOutputProgramId] = useState('');
  const [outputType, setOutputType] = useState<OutputType>('DRAW');
  const [outputDate, setOutputDate] = useState('');
  const [selectedAdditionalPrizes, setSelectedAdditionalPrizes] = useState<{ prizeId: string, quantity: number }[]>([]); // RESTORED FOR COMBOS

  // Programs State
  const [programs, setPrograms] = useState<Program[]>([]);

  // Stations State (NEW)
  const [stations, setStations] = useState<RadioStation[]>([]);

  // Winner Fields State
  const [winnerName, setWinnerName] = useState('');
  const [winnerPhone, setWinnerPhone] = useState('');
  const [winnerEmail, setWinnerEmail] = useState('');
  const [winnerDoc, setWinnerDoc] = useState('');
  const [winnerAddress, setWinnerAddress] = useState('');
  const [winnerHistory, setWinnerHistory] = useState<PrizeOutput[]>([]);

  // Edit Output State (Placeholder for future expansion)
  const [editingOutput, setEditingOutput] = useState<PrizeOutput | null>(null);
  const [viewingOutput, setViewingOutput] = useState<PrizeOutput | null>(null); // New state for viewing details

  // Delete Confirmation Modal State (Outputs)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [outputToDelete, setOutputToDelete] = useState<PrizeOutput | null>(null);
  const [returnToStock, setReturnToStock] = useState(true);

  // Delete Confirmation Modal State (Prizes)
  const [prizeDeleteModalOpen, setPrizeDeleteModalOpen] = useState(false);
  const [prizeToDelete, setPrizeToDelete] = useState<Prize | null>(null);

  // Script Modal State
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');

  // Script Configuration Modal State
  const [scriptConfigModalOpen, setScriptConfigModalOpen] = useState(false);
  const [selectedPrizeForScript, setSelectedPrizeForScript] = useState<Prize | null>(null);
  const [scriptProgramId, setScriptProgramId] = useState('');

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Loading State
  const [loading, setLoading] = useState(true);

  // --- Master Inventory State (NEW) ---
  const [masterItemFormOpen, setMasterItemFormOpen] = useState(false);
  const [distributionModalOpen, setDistributionModalOpen] = useState(false);
  const [selectedMasterItem, setSelectedMasterItem] = useState<MasterInventory | null>(null);
  const [viewingPhotos, setViewingPhotos] = useState<{ item: MasterInventory; photos: MasterInventoryPhoto[] } | null>(null);

  // --- Multi-Tenancy State (NEW) ---
  const [selectedStationId, setSelectedStationId] = useState<string | null>(() => {
    // Carregar do localStorage
    return localStorage.getItem('selectedStationId') || null;
  });

  // --- Radio Mode State (NEW) ---
  const [currentRadio, setCurrentRadio] = useState<RadioStation | null>(() => {
    const saved = localStorage.getItem('currentRadio');
    return saved ? JSON.parse(saved) : null;
  });
  const [isRadioMode, setIsRadioMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get('radio');
  });
  const [radioSlug, setRadioSlug] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('radio');
  });


  const [editStationModalOpen, setEditStationModalOpen] = useState(false);
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [createRadioModalOpen, setCreateRadioModalOpen] = useState(false);

  const handleStationChange = (stationId: string | null) => {
    setSelectedStationId(stationId);
    if (stationId) {
      localStorage.setItem('selectedStationId', stationId);
    } else {
      localStorage.removeItem('selectedStationId');
    }
    // Recarregar dados
    fetchData();
  };

  const handleDashboardStationSelect = (stationId: string) => {
    handleStationChange(stationId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast('Visualizando estação selecionada', 'info');
  };



  // --- Toast State ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
    let url = `${window.location.protocol}//${window.location.host}${window.location.pathname}?role=${role}`;

    // Para Locutor/Operador, adicionar o slug da rádio para garantir isolamento
    if (role === 'OPERATOR') {
      if (isRadioMode && currentRadio) {
        url += `&radio=${currentRadio.slug}`;
      } else if (selectedStationId) {
        const station = stations.find(s => s.id === selectedStationId);
        if (station) {
          url += `&radio=${station.slug}`;
        }
      }
    }

    return url;
  };

  // --- Filter Logic ---
  const filteredOutputs = outputs.filter(output => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (output.winnerName && String(output.winnerName).toLowerCase().includes(q)) ||
      (output.prizeName && String(output.prizeName).toLowerCase().includes(q)) ||
      (output.note && String(output.note).toLowerCase().includes(q)) ||
      (output.date && String(output.date).includes(q)) ||
      (output.winnerDoc && String(output.winnerDoc).includes(q))
    );
  }).filter(output => {
    // General Filter: Hide Combo parts from the list to prevent "duplication" visual
    // Defensive check: Ensure note is a string before checking includes
    if (output && typeof output.note === 'string' && output.note.includes('(Combo)')) {
      return false;
    }

    // Filtro para Recepção e Admin (Abas de Status)
    if (userRole === 'RECEPTION' || (userRole === 'ADMIN' && activeTab === 'OUTPUTS')) {
      const deadline = new Date(output.pickupDeadline);
      const now = new Date();
      // Reset time for strict date comparison if needed, but loose comparison is usually fine
      const isExpired = output.status === 'PENDING' && deadline < now;

      // Note: Default 'receptionTab' state is used for both roles now
      if (receptionTab === 'PENDING') {
        return output.status === 'PENDING' && !isExpired;
      }
      if (receptionTab === 'DELIVERED') {
        const deliveredDate = new Date(output.deliveredDate || output.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return output.status === 'DELIVERED' && deliveredDate > thirtyDaysAgo; // Show only last 30 days
      }
      if (receptionTab === 'EXPIRED') {
        // Show expired items only for 5 days after deadline
        const expirationLimit = new Date(deadline);
        expirationLimit.setDate(expirationLimit.getDate() + 5);
        return isExpired && now <= expirationLimit;
      }
    }

    return true;
  });

  const filteredPrizes = useMemo(() => {
    let filtered = prizes;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }

    // Filter by Role/Tab
    if (userRole === 'OPERATOR') {
      const now = new Date();
      filtered = filtered.filter(p => {
        // 1. Must have stock
        if (p.availableQuantity <= 0) return false;

        // 2. Manual Override (Always Show)
        if (p.isOnAir) return true;

        // 3. Automated Schedule (Show 30min before)
        if (p.scheduled_for) {
          const scheduledTime = new Date(p.scheduled_for).getTime();
          const diffMinutes = (scheduledTime - now.getTime()) / (1000 * 60);
          return diffMinutes <= 30; // Shows if starts in <= 30 mins (or is in past)
        }

        return false;
      });
    } else if (activeTab === 'INVENTORY' && userRole === 'ADMIN') {
      // Admin Inventory: Hide "On Air" items to keep list clean
      filtered = filtered.filter(p => !p.isOnAir);
    }

    return filtered;
  }, [prizes, searchQuery, userRole, activeTab]);
  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);

    // Filtros baseados no papel e estação selecionada
    let prizesQuery = supabase.from('prizes').select('*');
    let outputsQuery = supabase.from('outputs').select('*');

    // ISOLAMENTO TOTAL: Se estiver em modo rádio, filtrar OBRIGATORIAMENTE pela rádio atual
    const filterStationId = (isRadioMode && currentRadio) ? currentRadio.id : selectedStationId;

    if (filterStationId) {
      prizesQuery = prizesQuery.eq('radio_station_id', filterStationId);
      outputsQuery = outputsQuery.eq('radio_station_id', filterStationId);
    }

    const { data: prizesData, error: prizesError } = await prizesQuery;
    if (prizesData) setPrizes(prizesData as Prize[]);
    if (prizesError) console.error("Error fetching prizes:", prizesError);

    const { data: outputsData, error: outputsError } = await outputsQuery;
    if (outputsData) setOutputs(outputsData as PrizeOutput[]);
    if (outputsError) console.error("Error fetching outputs:", outputsError);

    setLoading(false);
  }, [selectedStationId, isRadioMode, currentRadio, userRole]);

  const fetchPrograms = async () => {
    let programsQuery = supabase.from('programs').select('*').order('name');

    // Filtrar por estação se selecionada (ou forçada por modo rádio)
    const filterStationId = (isRadioMode && currentRadio) ? currentRadio.id : selectedStationId;

    if (filterStationId) {
      programsQuery = programsQuery.eq('radio_station_id', filterStationId);
    }

    const { data, error } = await programsQuery;
    if (error) {
      console.error('Erro ao buscar programas:', error);
      // Fallback se a tabela não existir ainda
      setPrograms([
        { id: '1', name: 'Manhã Bandeirantes', active: true },
        { id: '2', name: 'Esporte em Debate', active: true },
        { id: '3', name: 'Jornada Esportiva', active: true },
        { id: '4', name: 'Apito Final', active: true },
        { id: '5', name: 'Nossa Área', active: true },
      ]);
    } else {
      setPrograms(data || []);
    }
  };

  const fetchStations = async () => {
    const { data, error } = await supabase
      .from('radio_stations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setStations(data);
    }
  };

  // --- Initialization & Realtime ---
  useEffect(() => {
    fetchData();
    fetchPrograms();
    fetchStations(); // NEW

    const channels = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prizes' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'outputs' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');

    if (roleParam === 'OPERATOR') {
      setUserRole('OPERATOR');
      setActiveTab('INVENTORY');
    } else if (roleParam === 'RECEPTION') {
      setUserRole('RECEPTION');
      setActiveTab('OUTPUTS');
    }

    return () => {
      supabase.removeChannel(channels);
    };
  }, [fetchData]);

  // History Check Logic
  useEffect(() => {
    if (winnerName.length > 3) {
      const history = outputs.filter(o =>
        o.winnerName && o.winnerName.toLowerCase().includes(winnerName.toLowerCase())
      );
      setWinnerHistory(history);
    } else {
      setWinnerHistory([]);
    }
  }, [winnerName, outputs]);

  // --- Handlers ---

  const handleAdminLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === (import.meta.env.VITE_ADMIN_PASSWORD || '1518')) {
      setUserRole('ADMIN');
      setActiveTab('DASHBOARD');
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      addToast('Senha incorreta!', 'error');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleSavePrize = async (prize: Prize, sourcePrizeId?: string, refundPrizeId?: string, additionalPrizes?: { prizeId: string, quantity: number }[]) => {
    if (userRole !== 'ADMIN') return;

    // Logic to handle additional prizes (Combos)
    if (additionalPrizes && additionalPrizes.length > 0) {
      let extraNames = [];
      prize.comboDetails = additionalPrizes; // Store combo details for future reference

      for (const extra of additionalPrizes) {
        const extraPrize = prizes.find(p => p.id === extra.prizeId);
        if (extraPrize) {
          // Debit stock for extra prize
          const newQuantity = extraPrize.availableQuantity - extra.quantity;
          await supabase.from('prizes').update({ availableQuantity: newQuantity }).eq('id', extra.prizeId);
          extraNames.push(`${extra.quantity}x ${extraPrize.name}`);
        }
      }
      // Append extras to the main prize name for visibility
      if (extraNames.length > 0) {
        prize.name = `${prize.name} + ${extraNames.join(' + ')}`;
      }
    }

    // Se tiver refundPrizeId, significa que é para devolver ao estoque (Correção/Troca)
    if (refundPrizeId) {
      const refundPrize = prizes.find(p => p.id === refundPrizeId);
      if (refundPrize) {
        const newRefundQuantity = refundPrize.availableQuantity + prize.totalQuantity;
        const { error: refundError } = await supabase.from('prizes')
          .update({ availableQuantity: newRefundQuantity })
          .eq('id', refundPrizeId);

        if (refundError) {
          console.error("Erro ao devolver estoque (Troca):", refundError);
          addToast("Erro ao devolver item antigo ao estoque.", 'error');
          return;
        }
      }
    }

    // Se tiver sourcePrizeId, significa que é para debitar do estoque
    if (sourcePrizeId) {
      const sourcePrize = prizes.find(p => p.id === sourcePrizeId);
      if (sourcePrize) {
        if (sourcePrize.availableQuantity < prize.totalQuantity) {
          addToast("Quantidade insuficiente no estoque!", 'error');
          return;
        }

        // 1. Atualiza o prêmio de origem (subtrai do estoque)
        const newSourceQuantity = sourcePrize.availableQuantity - prize.totalQuantity;
        const { error: updateError } = await supabase.from('prizes')
          .update({ availableQuantity: newSourceQuantity })
          .eq('id', sourcePrizeId);

        if (updateError) {
          console.error("Erro ao atualizar estoque:", updateError);
          addToast("Erro ao debitar do estoque.", 'error');
          return;
        }
      }
    }

    // Sanitize payload
    if (!prize.scheduled_for) {
      delete prize.scheduled_for;
    }
    if (!prize.photo_url) {
      delete prize.photo_url;
    }

    const { error } = await supabase.from('prizes').upsert(prize);

    if (error) {
      console.error("Erro ao salvar:", error);
      addToast("Erro ao salvar no banco de dados.", 'error');
    } else {
      addToast("Prêmio salvo com sucesso!", 'success');
      setIsFormOpen(false);
      setEditingPrize(undefined);
      setFormIsQuickDraw(false);
      fetchData();
    }
  };

  const handleDeletePrize = (id: string) => {
    if (userRole !== 'ADMIN') return;
    const prize = prizes.find(p => p.id === id);
    if (prize) {
      setPrizeToDelete(prize);
      setPrizeDeleteModalOpen(true);
    }
  };

  const confirmDeletePrize = async () => {
    if (!prizeToDelete) return;

    const { error } = await supabase.from('prizes').delete().eq('id', prizeToDelete.id);

    if (error) {
      console.error("Erro ao excluir prêmio:", error);
      addToast("Erro ao excluir prêmio.", 'error');
    } else {
      addToast("Prêmio excluído do estoque!", 'success');
      setPrizeDeleteModalOpen(false);
      setPrizeToDelete(null);
      fetchData();
    }
  };

  const handleEditPrize = (prize: Prize) => {
    if (userRole !== 'ADMIN') return;
    setEditingPrize(prize);
    setFormIsQuickDraw(false);
    setIsFormOpen(true);
  };

  const handleToggleOnAir = async (prize: Prize) => {
    if (userRole !== 'ADMIN') return;
    await supabase.from('prizes').update({ isOnAir: !prize.isOnAir }).eq('id', prize.id);
    fetchData();
  };

  const openOutputModal = (prize: Prize) => {
    // Reset states first to avoid ghost data
    setSelectedPrizeForOutput(null);
    setTimeout(() => {
      setSelectedPrizeForOutput(prize);
      setOutputQuantity(1); // Default to 1 as per user request
      setOutputNote('');
      setWinnerName('');
      setWinnerPhone('');
      setWinnerEmail('');
      setWinnerDoc('');
      setWinnerAddress('');
      setOutputType('DRAW');
      setOutputProgramId(programs.length > 0 ? programs[0].id : '');
      setOutputDate(new Date().toISOString().split('T')[0]); // Default to today

      // Pre-fill additional prizes if they exist in comboDetails
      if (prize.comboDetails && prize.comboDetails.length > 0) {
        setSelectedAdditionalPrizes(prize.comboDetails);
      } else {
        setSelectedAdditionalPrizes([]);
      }

      setOutputModalOpen(true);
    }, 0);
  };

  const handleRegisterOutput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrizeForOutput) return;
    if (userRole === 'RECEPTION') return;

    if (outputQuantity > selectedPrizeForOutput.availableQuantity) {
      addToast("Quantidade de saída maior que a disponível!", 'error');
      return;
    }

    if (!winnerName) {
      addToast("Por favor, informe o nome do ganhador.", 'error');
      return;
    }

    const today = new Date(outputDate); // Use selected date
    // Fix timezone issue
    const [year, month, day] = outputDate.split('-').map(Number);

    // Create date object properly.
    // If user selected "Today", we want the CURRENT TIME.
    // If not, we set it to noon to avoid timezone rollover.
    const now = new Date();
    const isTopicDay = now.getDate() === day && (now.getMonth() + 1) === month && now.getFullYear() === year;

    const dateObj = isTopicDay ? new Date() : new Date(year, month - 1, day, 12, 0, 0);

    const deadlineDate = addBusinessDays(dateObj, selectedPrizeForOutput.pickupDeadlineDays);

    const selectedProgram = programs.find(p => p.id === outputProgramId);
    const programName = selectedProgram ? selectedProgram.name : 'Avulso';
    const finalNote = outputType === 'GIFT' ? `Brinde/Diretoria - ${programName}` : programName;

    // 1. Register Main Prize
    const newOutput: PrizeOutput = {
      id: crypto.randomUUID(),
      prizeId: selectedPrizeForOutput.id,
      prizeName: selectedPrizeForOutput.name,
      quantity: outputQuantity,
      note: finalNote,
      programId: outputProgramId || null,
      programName: programName,
      type: outputType,
      date: dateObj.toISOString(), // Use selected date
      pickupDeadline: deadlineDate.toISOString(),
      status: 'PENDING',
      winnerName,
      winnerPhone,
      winnerEmail,
      winnerDoc,
      winnerAddress,
    };

    const { error: insertError } = await supabase.from('outputs').insert({
      ...newOutput,
      radio_station_id: selectedStationId // Multi-tenancy
    });
    if (insertError) {
      addToast("Erro ao registrar ganhador.", 'error');
      return;
    }

    const newQuantity = selectedPrizeForOutput.availableQuantity - outputQuantity;
    // User requested that the prize disappears from Operator view immediately after draw
    // So we set isOnAir to false.
    await supabase.from('prizes').update({
      availableQuantity: newQuantity,
      isOnAir: false
    }).eq('id', selectedPrizeForOutput.id);

    // 2. Register Additional Prizes (Combos)
    // 2. Register Additional Prizes (Combos)
    for (const extra of selectedAdditionalPrizes) {
      const extraPrize = prizes.find(p => p.id === extra.prizeId);
      if (extraPrize) {
        const extraOutput: PrizeOutput = {
          ...newOutput,
          id: crypto.randomUUID(),
          prizeId: extraPrize.id,
          prizeName: extraPrize.name,
          quantity: extra.quantity,
          note: `${finalNote} (Combo)`, // Mark as combo
        };

        await supabase.from('outputs').insert({
          ...extraOutput,
          radio_station_id: selectedStationId // Multi-tenancy
        });

        // Check if this item was already debited as part of the combo package
        const preDebitedItem = selectedPrizeForOutput.comboDetails?.find(
          c => c.prizeId === extra.prizeId
        );

        // Calculate how much to debit (Current Quantity - Pre-debited Quantity)
        // If result is <= 0, it means it's fully covered by the pre-debit.
        const quantityToDebit = extra.quantity - (preDebitedItem ? preDebitedItem.quantity : 0);

        if (quantityToDebit > 0) {
          const extraNewQty = extraPrize.availableQuantity - quantityToDebit;
          await supabase.from('prizes').update({ availableQuantity: extraNewQty }).eq('id', extraPrize.id);
        }
      }
    }

    setOutputModalOpen(false);
    setSelectedPrizeForOutput(null);
    setSelectedAdditionalPrizes([]);
    addToast("Saída(s) registrada(s) com sucesso!", 'success');
    fetchData();
    if (userRole === 'ADMIN') setActiveTab('OUTPUTS');
  };

  const handleConfirmPickup = async (outputId: string, photo?: string) => {
    if (userRole === 'OPERATOR') return;

    // Confirm dialog is handled by PickupModal now
    // Find the specific output to get details
    const targetOutput = outputs.find(o => o.id === outputId);

    if (targetOutput) {
      // Update ALL items that share the same winner and date (cascading to hidden combo items)
      const relatedQuery = supabase.from('outputs')
        .update({
          status: 'DELIVERED',
          deliveredDate: new Date().toISOString(),
          audit_photo: photo || null // Save photo
        })
        .eq('winnerName', targetOutput.winnerName)
        .eq('date', targetOutput.date);

      await relatedQuery;
      fetchData();
      addToast('Entrega confirmada com sucesso!', 'success');
    }
  };

  const handleDeleteOutput = (outputId: string) => {
    if (userRole !== 'ADMIN') return;
    const output = outputs.find(o => o.id === outputId);
    if (output) {
      setOutputToDelete(output);
      setReturnToStock(true); // Default to true
      setDeleteModalOpen(true);
    }
  };

  const confirmDeleteOutput = async () => {
    if (!outputToDelete) return;

    // 1. Devolver ao estoque (Se marcado)
    if (returnToStock) {
      // Fetch fresh prize data to ensure accuracy
      const { data: currentPrize, error: fetchError } = await supabase
        .from('prizes')
        .select('*')
        .eq('id', outputToDelete.prizeId)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar prêmio para devolução:", fetchError);
        // If prize doesn't exist anymore, we can't return stock, but we can still delete the output
        if (fetchError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
          addToast("Erro ao verificar estoque. Tente novamente.", 'error');
          return;
        }
      }

      if (currentPrize) {
        const newQuantity = currentPrize.availableQuantity + outputToDelete.quantity;
        const { error: updateError } = await supabase.from('prizes')
          .update({ availableQuantity: newQuantity })
          .eq('id', currentPrize.id);

        if (updateError) {
          console.error("Erro ao devolver estoque:", updateError);
          addToast("Erro ao devolver item ao estoque.", 'error');
          return;
        }
      }
    }

    // 2. Excluir Saída
    const { error } = await supabase.from('outputs').delete().eq('id', outputToDelete.id);

    if (error) {
      console.error("Erro ao excluir:", error);
      addToast("Erro ao excluir saída.", 'error');
    } else {
      addToast(returnToStock ? "Saída excluída e estoque atualizado!" : "Saída excluída (estoque mantido).", 'success');
      setDeleteModalOpen(false);
      setOutputToDelete(null);
      fetchData();
    }
  };

  const handleEditOutput = (output: PrizeOutput) => {
    if (userRole !== 'ADMIN') return;
    setEditingOutput({ ...output });
  };

  const handleSaveEditedOutput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOutput) return;

    const selectedProgram = programs.find(p => p.id === editingOutput.programId);
    const programName = selectedProgram ? selectedProgram.name : (editingOutput.programName || 'Avulso');

    // Update note if program changed
    let finalNote = editingOutput.note;
    if (editingOutput.type === 'GIFT') {
      finalNote = `Brinde/Diretoria - ${programName}`;
    } else {
      finalNote = programName;
    }

    const { error } = await supabase.from('outputs').update({
      winnerName: editingOutput.winnerName,
      winnerPhone: editingOutput.winnerPhone,
      winnerEmail: editingOutput.winnerEmail,
      winnerDoc: editingOutput.winnerDoc,
      winnerAddress: editingOutput.winnerAddress,
      programId: editingOutput.programId,
      programName: programName,
      note: finalNote,
      type: editingOutput.type,
      date: editingOutput.date, // Update date
      pickupDeadline: editingOutput.pickupDeadline // Update deadline
    }).eq('id', editingOutput.id);

    if (error) {
      console.error("Erro ao atualizar:", error);
      addToast("Erro ao atualizar registro.", 'error');
    } else {
      addToast("Registro atualizado com sucesso!", 'success');
      setEditingOutput(null);
      fetchData();
    }
  };

  const handleGenerateScript = (prize: Prize) => {
    setSelectedPrizeForScript(prize);
    setScriptProgramId(programs.length > 0 ? programs[0].id : '');
    setScriptConfigModalOpen(true);
  };

  const generateDynamicScript = (programName: string, prize: Prize, pickupDateStr: string) => {
    const quantity = prize.availableQuantity;
    const quantityText = quantity > 1 ? `HOJE TEMOS ${quantity} PRÊMIOS` : "HOJE TEMOS UM PRÊMIO ESPECIAL";
    const winnerText = quantity > 1 ? `PARA ${quantity} OUVINTES` : "PARA UM OUVINTE DE SORTE";

    const intros = [
      `E HOJE AQUI NO ${programName.toUpperCase()} VOCÊ QUE PARTICIPA PELO YOUTUBE PODE GANHAR PRÊMIOS.`,
      `ATENÇÃO OUVINTES DO ${programName.toUpperCase()}! CHEGOU A HORA DE GANHAR PRÊMIOS NO YOUTUBE.`,
      `QUEM TÁ LIGADO NO ${programName.toUpperCase()} PELO YOUTUBE TEM CHANCE DE GANHAR AGORA!`,
      `O ${programName.toUpperCase()} TÁ CHEIO DE PRÊMIOS HOJE PRA QUEM TÁ NO YOUTUBE!`,
    ];

    const bodies = [
      `${quantityText} ${winnerText}: *${prize.name.toUpperCase()}*!`,
      `OLHA SÓ O QUE SEPARAMOS PRA VOCÊS: *${prize.name.toUpperCase()}*! ${quantityText}!`,
      `O PRÊMIO DE HOJE É TOP: *${prize.name.toUpperCase()}*! ${winnerText} VAI LEVAR!`,
      `QUER GANHAR *${prize.name.toUpperCase()}*? ${quantityText} ESPERANDO POR VOCÊ!`,
    ];

    const ctas = [
      "E PARA PARTICIPAR ENTRE AGORA NA TRANSMISSÃO DO YOUTUBE DA RÁDIOBANDEIRANTESCAMPINAS PREENCHA O FORMULÁRIO QUE ESTA FIXADO NOS COMENTARIOS OU ACESSE NOSSO SITE WWW.RADIOBANDEIRANTESCAMPINAS.COM.BR / VA ATE PROMOÇÕES E PREENCHA O FORMULARIO E BOA SORTE.",
      "CORRE PRO YOUTUBE DA RÁDIOBANDEIRANTESCAMPINAS! O LINK TÁ FIXADO NO CHAT. OU VAI NO SITE WWW.RADIOBANDEIRANTESCAMPINAS.COM.BR NA ABA PROMOÇÕES. NÃO PERDE TEMPO!",
      "PRA CONCORRER É FÁCIL: ENTRA NO YOUTUBE DA RÁDIOBANDEIRANTESCAMPINAS E CLICA NO LINK FIXADO. OU ACESSE WWW.RADIOBANDEIRANTESCAMPINAS.COM.BR E SE INSCREVE EM PROMOÇÕES!",
      "JÁ SE INSCREVEU? O LINK TÁ NOS COMENTÁRIOS DO YOUTUBE DA RÁDIOBANDEIRANTESCAMPINAS OU NO NOSSO SITE WWW.RADIOBANDEIRANTESCAMPINAS.COM.BR. BOA SORTE!",
    ];

    const outros = [
      "VAMOS DIVULGAR O GANHADOR NO FINAL DO PROGRAMA. E SE VOCÊ NÃO TIVER COMO BUSCAR O PREMIO, ENTÃO NEM PARTICIPE, DEIXE PARA OUTRA PESSOA, POIS, A RETIRADA É OBRIGATÓRIA DA PESSOA SORTEADA.",
      "O RESULTADO SAI NO FINAL DO PROGRAMA! LEMBRANDO: TEM QUE VIR BUSCAR O PRÊMIO, SE NÃO PUDER, NÃO TIRE A CHANCE DE OUTRO OUVINTE. RETIRADA OBRIGATÓRIA!",
      "FIQUE LIGADO QUE NO FINAL DO PROGRAMA A GENTE CONTA QUEM GANHOU. IMPORTANTE: A RETIRADA É PRESENCIAL E OBRIGATÓRIA, SÓ PARTICIPE SE PUDER VIR BUSCAR!",
    ];

    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    return `${getRandom(intros)}\n${getRandom(bodies)}\n${getRandom(ctas)}\n${getRandom(outros)}\nRETIRADA ATÉ DIA ${pickupDateStr}`;
  };

  const confirmGenerateScript = () => {
    if (!selectedPrizeForScript) return;

    const selectedProgram = programs.find(p => p.id === scriptProgramId);
    const programName = selectedProgram ? selectedProgram.name : "Esporte em Debate";

    const today = new Date();
    const pickupDate = addBusinessDays(today, selectedPrizeForScript.pickupDeadlineDays);
    const pickupDateStr = pickupDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    const script = generateDynamicScript(programName, selectedPrizeForScript, pickupDateStr);

    setGeneratedScript(script);
    setScriptConfigModalOpen(false);
    setScriptModalOpen(true);
  };

  // Program Management Handlers
  const handleAddProgram = async () => {
    const name = prompt("Nome do novo programa:");
    if (!name) return;

    const { error } = await supabase.from('programs').insert({
      name,
      active: true,
      radio_station_id: selectedStationId // Multi-tenancy
    });
    if (error) {
      addToast("Erro ao criar programa. Verifique se a tabela 'programs' existe.", 'error');
      // Fallback local
      const newProgram: Program = { id: Date.now().toString(), name, active: true };
      setPrograms([...programs, newProgram]);
    } else {
      addToast("Programa criado!", 'success');
      fetchPrograms();
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Excluir este programa?")) return;
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) {
      addToast("Erro ao excluir. (Modo Local)", 'info');
      setPrograms(programs.filter(p => p.id !== id));
    } else {
      addToast("Programa excluído!", 'success');
      fetchPrograms();
    }
  };

  const handleExtendDeadline = async (outputId: string) => {
    if (userRole !== 'ADMIN') return;

    const daysStr = prompt("Quantos dias úteis deseja adicionar?", "3");
    if (!daysStr) return;
    const days = parseInt(daysStr);
    if (isNaN(days) || days <= 0) {
      addToast("Quantidade inválida.", 'error');
      return;
    }

    // Estende a partir de HOJE
    const newDeadline = addBusinessDays(new Date(), days).toISOString();

    const { error } = await supabase.from('outputs').update({ pickupDeadline: newDeadline }).eq('id', outputId);

    if (error) {
      addToast("Erro ao estender prazo.", 'error');
    } else {
      addToast(`Prazo estendido por mais ${days} dias úteis!`, 'success');
      fetchData();
    }
  };

  const handleGenerateTestData = async () => {
    if (userRole !== 'ADMIN') return;
    if (!confirm('Isso irá gerar dados fictícios para teste. Deseja continuar?')) return;

    setLoading(true);

    // 1. Criar Prêmios
    const testPrizes: Prize[] = [
      { id: crypto.randomUUID(), name: 'Par de Ingressos Cinema', description: 'Válido para qualquer filme 2D', totalQuantity: 10, availableQuantity: 5, entryDate: new Date().toISOString(), validityDate: '2025-12-31', maxDrawDate: '2025-12-31', pickupDeadlineDays: 3, isOnAir: true },
      { id: crypto.randomUUID(), name: 'Voucher Jantar', description: 'Restaurante Bom Sabor - R$ 100,00', totalQuantity: 5, availableQuantity: 2, entryDate: new Date().toISOString(), validityDate: '2025-11-30', maxDrawDate: '2025-11-30', pickupDeadlineDays: 5, isOnAir: false },
    ];

    for (const p of testPrizes) {
      await supabase.from('prizes').upsert(p);
    }

    // 2. Criar Saídas (Ganhadores)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10); // 10 dias atrás

    const testOutputs: PrizeOutput[] = [
      {
        id: crypto.randomUUID(),
        prizeId: testPrizes[0].id,
        prizeName: testPrizes[0].name,
        quantity: 1,
        note: 'Sorteio Manhã',
        date: new Date().toISOString(),
        pickupDeadline: addBusinessDays(new Date(), 3).toISOString(), // No prazo
        status: 'PENDING',
        winnerName: 'João da Silva (No Prazo)',
        winnerPhone: '(19) 99999-9999',
        winnerDoc: '123.456.789-00',
        type: 'DRAW',
        programName: 'Manhã Bandeirantes'
      },
      {
        id: crypto.randomUUID(),
        prizeId: testPrizes[0].id,
        prizeName: testPrizes[0].name,
        quantity: 1,
        note: 'Sorteio Tarde',
        date: pastDate.toISOString(),
        pickupDeadline: pastDate.toISOString(), // Expirado
        status: 'PENDING',
        winnerName: 'Maria Souza (Expirado)',
        winnerPhone: '(19) 88888-8888',
        winnerDoc: '987.654.321-00',
        type: 'DRAW',
        programName: 'Esporte em Debate'
      }
    ];

    for (const o of testOutputs) {
      await supabase.from('outputs').insert({
        ...o,
        radio_station_id: selectedStationId // Multi-tenancy (test data)
      });
    }

    setLoading(false);
    addToast("Dados de teste gerados com sucesso!", 'success');
    fetchData();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    addToast('Texto copiado para a área de transferência!', 'success');
  };

  const totalAvailable = prizes.reduce((acc, curr) => acc + curr.availableQuantity, 0);
  const pendingPickups = outputs.filter(w => w.status === 'PENDING').length;

  // Handle radio login success
  const handleRadioLoginSuccess = (station: RadioStation) => {
    setCurrentRadio(station);
    setSelectedStationId(station.id);
    setUserRole('ADMIN');
    setIsRadioMode(true);
  };

  // Handle radio logout
  const handleRadioLogout = () => {
    localStorage.removeItem('currentRadio');
    localStorage.removeItem('radioLoginTime');
    setCurrentRadio(null);
    setIsRadioMode(false);
    setUserRole(null);
    window.location.href = '/';
  };

  // Radio Mode - Show Login Page
  if (isRadioMode && !userRole && radioSlug) {
    return <RadioLoginPage slug={radioSlug} onLoginSuccess={handleRadioLoginSuccess} />;
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col min-h-[400px]">
          <div className="bg-blue-600 p-8 flex flex-col justify-center items-center text-white text-center">
            <div className="bg-white/20 p-4 rounded-full mb-4">
              <Radio size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-2">RadioPrize</h1>
            <p className="opacity-80">Gestão de Prêmios</p>
          </div>
          <div className="p-8 flex flex-col justify-center flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
              {showAdminLogin ? 'Área Administrativa' : 'Acesso ao Sistema'}
            </h2>
            {!showAdminLogin ? (
              <div className="space-y-4 max-w-sm mx-auto w-full">
                <button onClick={() => setShowAdminLogin(true)} className="w-full p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-4 group shadow-sm hover:shadow-md">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Shield size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">Entrar como Administrador</div>
                    <div className="text-xs text-gray-500">Requer senha de acesso</div>
                  </div>
                </button>
                <div className="text-center text-xs text-gray-400 mt-4">
                  Locutores e Recepção devem utilizar o link de acesso exclusivo.
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminLoginAttempt} className="space-y-4 max-w-sm mx-auto w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha de Acesso</label>
                  <div className="relative">
                    <input type="password" autoFocus className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                    <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowAdminLogin(false); setAdminPassword(''); }} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Voltar</button>
                  <button type="submit" className="flex-1 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200">Acessar</button>
                </div>
              </form>
            )}
          </div>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg"><Radio size={24} className="text-white" /></div>
          <div>
            <h1 className="font-bold text-lg leading-tight">
              {(isRadioMode && currentRadio) ? currentRadio.name : (selectedStationId ? (stations.find(s => s.id === selectedStationId)?.name || 'RadioPrize') : 'RadioPrize')}
            </h1>
            <p className="text-xs text-slate-400">{userRole === 'MASTER' && 'Master Central'}{userRole === 'ADMIN' && 'Administrador'}{userRole === 'OPERATOR' && 'Operador / No Ar'}{userRole === 'RECEPTION' && 'Recepção'}</p></div>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {userRole === 'MASTER' && (
            <>
              <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={20} /> Visão Geral</button>
              <button onClick={() => setActiveTab('OUTPUTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'OUTPUTS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Radio size={20} /> Gerenciar Rádios</button>
              <button onClick={() => setActiveTab('MASTER_INVENTORY')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'MASTER_INVENTORY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Warehouse size={20} /> Estoque Central</button>

            </>
          )}
          {userRole === 'ADMIN' && (
            <>
              <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={20} /> Visão Geral</button>
              <button onClick={() => setActiveTab('INVENTORY')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'INVENTORY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Gift size={20} /> Estoque Prêmios</button>
              <button onClick={() => setActiveTab('OUTPUTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'OUTPUTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><ClipboardList size={20} /> Saídas / Histórico</button>
              <button onClick={() => setActiveTab('PROGRAMS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'PROGRAMS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Settings size={20} /> Programas</button>
              <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                <button onClick={() => setShareModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-teal-400 hover:bg-teal-900/20 transition-colors"><Share2 size={20} /> Compartilhar</button>
              </div>
            </>
          )}
          {userRole === 'OPERATOR' && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700"><h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Modo No Ar</h3><p className="text-sm text-slate-300">Visualize apenas os prêmios liberados para sorteio.</p></div>
          )}
          {userRole === 'RECEPTION' && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700"><h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Modo Recepção</h3><p className="text-sm text-slate-300">Confira os dados e confirme a entrega dos prêmios.</p></div>
          )}
          <div className="mt-auto">
            <div className="px-4 py-2 mb-2 text-xs text-slate-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>Sistema Online</div>
            {(userRole === 'ADMIN' || userRole === 'MASTER') && (
              <button onClick={isRadioMode ? handleRadioLogout : handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"><LogOut size={20} /> Sair</button>
            )}
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {userRole === 'OPERATOR' ? 'Prêmios no Ar' : (activeTab === 'DASHBOARD' ? 'Visão Geral' : activeTab === 'INVENTORY' ? 'Controle de Estoque' : activeTab === 'MASTER_INVENTORY' ? 'Estoque Central' : activeTab === 'OUTPUTS' && userRole === 'MASTER' ? 'Gerenciamento de Rádios' : userRole === 'RECEPTION' ? 'Retirada de Prêmios' : 'Histórico de Saídas')}
              </h2>
              <p className="text-gray-500 text-sm">{userRole === 'OPERATOR' ? 'Itens disponíveis para sorteio imediato.' : (activeTab === 'OUTPUTS' && userRole === 'RECEPTION' ? 'Confirme a identidade do ouvinte antes de entregar.' : activeTab === 'OUTPUTS' && userRole === 'MASTER' ? 'Configure e gerencie as rádios da sua rede.' : 'Gerencie o fluxo de prêmios da emissora.')}</p>
            </div>
            <button onClick={() => fetchData()} title="Atualizar Dados Agora" className={`p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-all ${loading ? 'animate-spin bg-blue-100 text-blue-600' : ''}`}><RefreshCw size={20} /></button>
          </div>

          <div className="flex items-center gap-3">

            {/* Station Selector for MASTER/ADMIN - Hidden in radio mode */}
            {!isRadioMode && (userRole === 'MASTER' || userRole === 'ADMIN') && activeTab !== 'MASTER_INVENTORY' && (
              <div className="flex items-center gap-2">
                <StationSelector
                  selectedStationId={selectedStationId}
                  onStationChange={handleStationChange}
                  userRole={userRole}
                />
                {(userRole === 'MASTER' || userRole === 'ADMIN') && (
                  <button
                    onClick={() => setEditStationModalOpen(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Gerenciar Estações e Links"
                  >
                    <Settings size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Botões antigos removidos em favor do layout Sortly dentro da aba */}
          {activeTab === 'INVENTORY' && (userRole === 'ADMIN' || userRole === 'MASTER') && (
            null
          )}
        </header>

        {loading && !prizes.length && !outputs.length ? (
          <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin text-blue-600" size={32} /></div>
        ) : (
          <>
            {(activeTab === 'DASHBOARD' && (userRole === 'ADMIN' || userRole === 'MASTER')) && (
              <Dashboard
                prizes={prizes}
                outputs={outputs}
                userRole={userRole}
                selectedStationId={selectedStationId}
                stations={
                  (isRadioMode && currentRadio)
                    ? [currentRadio]
                    : (selectedStationId
                      ? stations.filter(s => s.id === selectedStationId)
                      : stations)
                }
                onOpenPerformance={() => setPerformanceModalOpen(true)}
              />
            )}

            {(activeTab === 'INVENTORY' || userRole === 'OPERATOR') && (
              <div>
                <SortlyInventory
                  prizes={filteredPrizes}
                  stations={stations}
                  onDelete={handleDeletePrize}
                  onEdit={handleEditPrize}
                  onAddNew={() => { setEditingPrize(undefined); setFormIsQuickDraw(false); setIsFormOpen(true); }}
                  onDataChange={fetchData}
                  userRole={userRole}
                  showSidebar={(userRole === 'ADMIN' || userRole === 'MASTER') && !isRadioMode}
                  onToggleOnAir={handleToggleOnAir}
                  onDraw={openOutputModal}
                  allPrizes={prizes}
                />
              </div>
            )}

            {(activeTab === 'OUTPUTS' || userRole === 'RECEPTION') && (
              <div>
                {/* MASTER: Radio Management */}
                {userRole === 'MASTER' && (
                  <RadioManagement
                    onStationsUpdated={fetchStations}
                    onCreateNew={() => setCreateRadioModalOpen(true)}
                  />
                )}

                {/* Admin: On Air Management Section */}
                {userRole === 'ADMIN' && (
                  <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <Radio size={20} className="text-indigo-600" />
                      Gerenciamento - Prêmios no Ar
                    </h3>
                    <p className="text-sm text-indigo-700 mb-4">
                      Estes são os prêmios visíveis para o locutor. Você pode editar, trocar estoque ou remover daqui.
                    </p>
                    <PrizeList
                      prizes={prizes.filter(p => p.isOnAir)}
                      role={userRole}
                      onDelete={handleDeletePrize}
                      onEdit={handleEditPrize}
                      onDraw={openOutputModal}
                      onGenerateScript={handleGenerateScript}
                      onToggleOnAir={handleToggleOnAir}
                      showStationName={true}
                      stations={stations}
                    />
                    {prizes.filter(p => p.isOnAir).length === 0 && (
                      <p className="text-sm text-indigo-400 italic text-center py-4">Nenhum prêmio no ar no momento.</p>
                    )}
                  </div>
                )}

                <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button
                      onClick={() => setReceptionTab('PENDING')}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${receptionTab === 'PENDING' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      Aguardando
                    </button>
                    <button
                      onClick={() => setReceptionTab('DELIVERED')}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${receptionTab === 'DELIVERED' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      Entregues
                    </button>
                    <button
                      onClick={() => setReceptionTab('EXPIRED')}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${receptionTab === 'EXPIRED' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      Expirados (5 dias)
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-full md:w-auto">
                    <Search size={20} className="text-gray-400 ml-2" />
                    <input type="text" placeholder="Buscar por ganhador..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 p-1"><X size={16} /></button>}
                  </div>
                </div>

                <WinnerList
                  winners={filteredOutputs}
                  role={userRole}
                  onConfirmPickup={handleConfirmPickup}
                  onEdit={handleEditOutput}
                  onDelete={handleDeleteOutput}
                  onExtendDeadline={handleExtendDeadline}
                  onView={(output) => setViewingOutput(output)}
                />
              </div>
            )}

            {activeTab === 'PROGRAMS' && userRole === 'ADMIN' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Gerenciar Programas</h3>
                  <button onClick={handleAddProgram} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><Plus size={18} /> Novo Programa</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nome do Programa</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {programs.map(prog => (
                        <tr key={prog.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-800 flex items-center gap-2"><Mic2 size={16} className="text-blue-500" /> {prog.name}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteProgram(prog.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><X size={16} /></button>
                          </td>
                        </tr>
                      ))}
                      {programs.length === 0 && <tr><td colSpan={2} className="p-8 text-center text-gray-400">Nenhum programa cadastrado.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                  <p className="font-bold mb-1">Dica:</p>
                  <p>Estes programas aparecerão na lista quando você for registrar um ganhador ou gerar um roteiro.</p>
                </div>
              </div>
            )}

            {/* MASTER INVENTORY TAB */}
            {activeTab === 'MASTER_INVENTORY' && userRole === 'MASTER' && (
              <MasterInventoryList
                onAddNew={() => setMasterItemFormOpen(true)}
                onDistribute={(item) => {
                  setSelectedMasterItem(item);
                  setDistributionModalOpen(true);
                }}
                onViewPhotos={async (item) => {
                  try {
                    const photos = await getItemPhotos(item.id);
                    setViewingPhotos({ item, photos });
                  } catch (error) {
                    console.error('Erro ao carregar fotos:', error);
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {isFormOpen && (userRole === 'ADMIN' || userRole === 'MASTER') && <PrizeForm role={userRole || 'OPERATOR'} initialData={editingPrize} prizes={prizes} onSave={handleSavePrize} onCancel={() => { setIsFormOpen(false); setEditingPrize(undefined); }} forceOnAir={formIsQuickDraw} />}

      {
        outputModalOpen && selectedPrizeForOutput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8 overflow-hidden">
              <div className="bg-gray-800 p-6 text-center text-white">
                <h3 className="text-xl font-bold uppercase mb-2">
                  {outputQuantity} {selectedPrizeForOutput.name}
                </h3>
                {selectedPrizeForOutput.comboDetails && selectedPrizeForOutput.comboDetails.length > 0 && (
                  <div className="text-sm text-gray-300 font-medium space-y-1">
                    {selectedPrizeForOutput.comboDetails.map((detail, idx) => {
                      const detailName = detail.name || prizes.find(p => p.id === detail.prizeId)?.name || 'Item Extra';
                      return (
                        <div key={idx} className="flex items-center justify-center gap-2">
                          <Plus size={12} className="text-green-400" />
                          <span>{detail.quantity} {detailName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <form onSubmit={handleRegisterOutput} className="p-6 space-y-4">
                {/* Row 1: Qty | Date | Program */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd.</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedPrizeForOutput.availableQuantity}
                      value={outputQuantity}
                      onChange={e => setOutputQuantity(Math.max(1, parseInt(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Sorteio</label>
                    <input
                      type="date"
                      required
                      value={outputDate}
                      onChange={e => setOutputDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Programa</label>
                    <select required value={outputProgramId} onChange={e => setOutputProgramId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none bg-white">
                      <option value="">Selecione...</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2: Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Ganhador *</label>
                  <input type="text" required value={winnerName} onChange={e => setWinnerName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none font-bold text-lg text-gray-800 placeholder-gray-300" placeholder="Nome completo" autoComplete="off" />
                  {winnerHistory.length > 0 && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase mb-2"><History size={14} /> Histórico Encontrado ({winnerHistory.length})</div><div className="max-h-24 overflow-y-auto space-y-1">{winnerHistory.map(h => (<div key={h.id} className="text-xs text-amber-900 flex justify-between border-b border-amber-100 pb-1 last:border-0"><span>{new Date(h.date).toLocaleDateString()} - {h.prizeName}</span><span className="opacity-70">{h.note}</span></div>))}</div></div>
                  )}
                </div>

                {/* Row 3: Phone | Doc */}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label><input type="tel" value={winnerPhone} onChange={e => setWinnerPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="(XX) 9XXXX-XXXX" /></div>
                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF / RG</label><input type="text" value={winnerDoc} onChange={e => setWinnerDoc(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" /></div>
                </div>

                {/* Row 4: Email */}
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input type="email" value={winnerEmail} onChange={e => setWinnerEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" /></div>

                {/* Row 5: City | Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade / Endereço</label>
                    <input type="text" value={winnerAddress} onChange={e => setWinnerAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                  </div>
                  <div className="bg-gray-100 p-2 rounded border border-gray-200 flex flex-col justify-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Prazo de Retirada</span>
                    <span className="font-bold text-gray-800">
                      {(() => {
                        if (!outputDate) return "--/--/----";
                        const [y, m, d] = outputDate.split('-').map(Number);
                        const dateObj = new Date(y, m - 1, d);
                        return addBusinessDays(dateObj, 3).toLocaleDateString(); // FIXED: Force 3 business days
                      })()}
                    </span>
                    <span className="text-[10px] text-gray-400">(3 dias úteis)</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                  <button type="button" onClick={() => { setOutputModalOpen(false); setSelectedPrizeForOutput(null); }} className="flex-1 py-4 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold text-sm uppercase transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 text-white bg-green-600 rounded-lg hover:bg-green-700 font-bold text-sm uppercase shadow-lg shadow-green-200 transition-colors">Confirmar Registro</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {
        prizeDeleteModalOpen && prizeToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100 bg-red-50 rounded-t-xl flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full text-red-600"><AlertTriangle size={24} /></div>
                <div><h3 className="text-lg font-bold text-gray-800">Excluir Prêmio?</h3><p className="text-xs text-red-600 font-semibold">Cuidado: Isso apaga o item do estoque.</p></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                  <p className="text-gray-500 mb-1">Você está prestes a excluir:</p>
                  <p className="font-bold text-gray-800 text-lg">{prizeToDelete.name}</p>
                  <p className="text-gray-600">Estoque Atual: {prizeToDelete.availableQuantity} / {prizeToDelete.totalQuantity}</p>
                </div>

                <p className="text-sm text-gray-600">
                  Isso removerá o prêmio da lista de disponíveis para sorteio. O histórico de ganhadores deste prêmio <strong>não</strong> será apagado.
                </p>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setPrizeDeleteModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Cancelar</button>
                  <button onClick={confirmDeletePrize} className="flex-1 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 font-bold shadow-lg shadow-red-200">Sim, Excluir</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        deleteModalOpen && outputToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100 bg-red-50 rounded-t-xl flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full text-red-600"><AlertTriangle size={24} /></div>
                <div><h3 className="text-lg font-bold text-gray-800">Confirmar Exclusão</h3><p className="text-xs text-red-600 font-semibold">Ação Irreversível</p></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                  <p className="text-gray-500 mb-1">Você está excluindo o registro de:</p>
                  <p className="font-bold text-gray-800 text-lg">{outputToDelete.winnerName}</p>
                  <p className="text-gray-600">{outputToDelete.prizeName} ({outputToDelete.quantity}x)</p>
                </div>

                {outputToDelete.status === 'PENDING' && (
                  <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-sm">
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                    <p><strong>Atenção:</strong> Este item ainda consta como <u>Aguardando Retirada</u> na recepção. Certifique-se de que o ouvinte não está a caminho.</p>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setReturnToStock(!returnToStock)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${returnToStock ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                    {returnToStock && <RefreshCw size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 select-none">
                    <p className="font-bold text-gray-800 text-sm">Devolver ao Estoque?</p>
                    <p className="text-xs text-gray-500">Se marcado, a quantidade ({outputToDelete.quantity}) será somada ao estoque atual.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Cancelar</button>
                  <button onClick={confirmDeleteOutput} className="flex-1 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 font-bold shadow-lg shadow-red-200">Excluir Registro</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Output Modal */}
      {editingOutput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings size={20} className="text-blue-600" />
                Editar Registro
              </h3>
              <p className="text-sm text-gray-600 mt-1">Prêmio: <span className="font-bold">{editingOutput.prizeName}</span></p>
            </div>
            <form onSubmit={handleSaveEditedOutput} className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data do Sorteio</label>
                  <input
                    type="datetime-local"
                    required
                    value={editingOutput.date ? new Date(editingOutput.date).toISOString().slice(0, 16) : ''}
                    onChange={e => {
                      const newDate = new Date(e.target.value);
                      // Recalculate deadline
                      // We need the prize's deadline days. We can try to find it in the prizes list.
                      const prize = prizes.find(p => p.id === editingOutput.prizeId);
                      let newDeadline = editingOutput.pickupDeadline;

                      if (prize) {
                        newDeadline = addBusinessDays(newDate, prize.pickupDeadlineDays).toISOString();
                      }

                      setEditingOutput({
                        ...editingOutput,
                        date: newDate.toISOString(),
                        pickupDeadline: newDeadline
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Programa / Evento</label>
                  <select
                    value={editingOutput.programId || ''}
                    onChange={e => setEditingOutput({ ...editingOutput, programId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Selecione um programa...</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Ganhador *</label>
                <input
                  type="text"
                  required
                  value={editingOutput.winnerName}
                  onChange={e => setEditingOutput({ ...editingOutput, winnerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={editingOutput.winnerPhone}
                    onChange={e => setEditingOutput({ ...editingOutput, winnerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF / RG</label>
                  <input
                    type="text"
                    value={editingOutput.winnerDoc}
                    onChange={e => setEditingOutput({ ...editingOutput, winnerDoc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={editingOutput.winnerEmail}
                  onChange={e => setEditingOutput({ ...editingOutput, winnerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço</label>
                <input
                  type="text"
                  value={editingOutput.winnerAddress}
                  onChange={e => setEditingOutput({ ...editingOutput, winnerAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingOutput(null)}
                  className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 font-bold shadow-lg shadow-blue-200"
                >
                  <Settings size={18} />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Script Configuration Modal */}
      {scriptConfigModalOpen && selectedPrizeForScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Gerar Roteiro
              </h3>
              <p className="text-sm text-gray-600 mt-1">Prêmio: <span className="font-bold">{selectedPrizeForScript.name}</span></p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Para qual programa?</label>
                <select
                  value={scriptProgramId}
                  onChange={(e) => setScriptProgramId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Selecione um programa...</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setScriptConfigModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmGenerateScript}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-colors flex items-center gap-2"
              >
                <FileText size={18} />
                Gerar Roteiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Script Modal */}
      {scriptModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText size={20} className="text-indigo-600" /> Roteiro para Locução</h3><button onClick={() => setScriptModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button></div>
            <div className="p-6"><textarea value={generatedScript} readOnly className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono text-sm leading-relaxed resize-none focus:outline-none" /><div className="flex gap-3 mt-4"><button onClick={() => setScriptModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Fechar</button><button onClick={copyToClipboard} className="flex-1 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold flex items-center justify-center gap-2"><Copy size={18} /> Copiar Texto</button></div></div>
          </div>
        </div>
      )
      }

      {
        shareModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Share2 size={20} className="text-teal-600" /> Links de Acesso</h3><button onClick={() => setShareModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button></div>
              <div className="p-6 space-y-6"><div className="space-y-4"><p className="text-sm text-gray-500">Envie estes links para que sua equipe acesse o sistema sem precisar de senha.<br /><span className="text-xs text-red-500 font-bold">Importante: O site precisa estar publicado no GitHub para os links funcionarem em outros computadores.</span></p><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Locutor / Operador</label><div className="flex gap-2"><input type="text" readOnly value={getShareLink('OPERATOR')} className="flex-1 bg-gray-50 border border-gray-200 p-2 rounded text-xs text-gray-600" /><button onClick={() => { navigator.clipboard.writeText(getShareLink('OPERATOR')); addToast('Link Copiado!', 'success'); }} className="bg-indigo-100 text-indigo-700 px-3 rounded hover:bg-indigo-200"><Copy size={16} /></button><a href={getShareLink('OPERATOR')} target="_blank" rel="noopener noreferrer" className="bg-gray-100 text-gray-700 px-3 rounded hover:bg-gray-200 flex items-center"><ExternalLink size={16} /></a></div></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recepção</label><div className="flex gap-2"><input type="text" readOnly value={getShareLink('RECEPTION')} className="flex-1 bg-gray-50 border border-gray-200 p-2 rounded text-xs text-gray-600" /><button onClick={() => { navigator.clipboard.writeText(getShareLink('RECEPTION')); addToast('Link Copiado!', 'success'); }} className="bg-green-100 text-green-700 px-3 rounded hover:bg-green-200"><Copy size={16} /></button><a href={getShareLink('RECEPTION')} target="_blank" rel="noopener noreferrer" className="bg-gray-100 text-gray-700 px-3 rounded hover:bg-gray-200 flex items-center"><ExternalLink size={16} /></a></div></div></div></div>
            </div>
          </div>
        )
      }
      {/* View Output Modal (Reception) */}
      {viewingOutput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  Detalhes do Ganhador
                </h3>
                <p className="text-sm text-gray-600 mt-1">Prêmio: <span className="font-bold">{viewingOutput.prizeName}</span></p>
              </div>
              <button onClick={() => setViewingOutput(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase mb-1">Nome Completo</p>
                <p className="text-lg font-bold text-gray-900">{viewingOutput.winnerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Telefone</p>
                  <p className="font-medium text-gray-800">{viewingOutput.winnerPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Documento (CPF/RG)</p>
                  <p className="font-medium text-gray-800">{viewingOutput.winnerDoc || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Email</p>
                <p className="font-medium text-gray-800">{viewingOutput.winnerEmail || '-'}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Endereço</p>
                <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded border border-gray-200">{viewingOutput.winnerAddress || '-'}</p>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Programa</p>
                  <p className="text-sm font-medium text-gray-800">{viewingOutput.programName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Data Sorteio</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(viewingOutput.date).toLocaleDateString()} às {new Date(viewingOutput.date).toLocaleTimeString().slice(0, 5)}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setViewingOutput(null)}
                  className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Output Modal (Reception) */}
      {viewingOutput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  Detalhes do Ganhador
                </h3>
                <p className="text-sm text-gray-600 mt-1">Prêmio: <span className="font-bold">{viewingOutput.prizeName}</span></p>
              </div>
              <button onClick={() => setViewingOutput(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase mb-1">Nome Completo</p>
                <p className="text-lg font-bold text-gray-900">{viewingOutput.winnerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Telefone</p>
                  <p className="font-medium text-gray-800">{viewingOutput.winnerPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Documento (CPF/RG)</p>
                  <p className="font-medium text-gray-800">{viewingOutput.winnerDoc || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Email</p>
                <p className="font-medium text-gray-800">{viewingOutput.winnerEmail || '-'}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Endereço</p>
                <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded border border-gray-200">{viewingOutput.winnerAddress || '-'}</p>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Programa</p>
                  <p className="text-sm font-medium text-gray-800">{viewingOutput.programName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Data Sorteio</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(viewingOutput.date).toLocaleDateString()} às {new Date(viewingOutput.date).toLocaleTimeString().slice(0, 5)}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setViewingOutput(null)}
                  className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER MODALS (Deprecated/Moved) */}
      {masterItemFormOpen && (
        <MasterItemForm
          onClose={() => setMasterItemFormOpen(false)}
          onSaved={() => {
            addToast('Item cadastrado com sucesso!', 'success');
            fetchData();
          }}
        />
      )}

      {viewingPhotos && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Fotos de Auditoria</h3>
                <p className="text-sm text-gray-600 mt-1">{viewingPhotos.item.item_name}</p>
              </div>
              <button onClick={() => setViewingPhotos(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <PhotoUpload
                masterInventoryId={viewingPhotos.item.id}
                existingPhotos={viewingPhotos.photos}
                onPhotoUploaded={async () => {
                  // Recarregar fotos
                  const photos = await getItemPhotos(viewingPhotos.item.id);
                  setViewingPhotos({ ...viewingPhotos, photos });
                }}
                onPhotoDeleted={async () => {
                  // Recarregar fotos
                  const photos = await getItemPhotos(viewingPhotos.item.id);
                  setViewingPhotos({ ...viewingPhotos, photos });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Manage Stations Modal */}
      {editStationModalOpen && (
        <ManageStationsModal
          isOpen={editStationModalOpen}
          onClose={() => setEditStationModalOpen(false)}
          onStationsUpdated={() => {
            fetchStations();
            addToast('Lista de estações atualizada!', 'success');
          }}
        />
      )}

      {/* Performance Modal */}
      <PerformanceModal
        isOpen={performanceModalOpen}
        onClose={() => setPerformanceModalOpen(false)}
        stations={(isRadioMode && currentRadio)
          ? [currentRadio]
          : (selectedStationId
            ? stations.filter(s => s.id === selectedStationId)
            : stations)}
        prizes={prizes}
        outputs={outputs}
      />

      {/* Create Radio Modal */}
      <CreateRadioModal
        isOpen={createRadioModalOpen}
        onClose={() => setCreateRadioModalOpen(false)}
        onCreated={() => {
          fetchStations();
          setCreateRadioModalOpen(false);
          addToast('Rádio criada com sucesso!', 'success');
        }}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div >
  );
};

export default App;

