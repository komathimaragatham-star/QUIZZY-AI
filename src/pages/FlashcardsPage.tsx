import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Check,
  X,
  HelpCircle,
  Sparkles,
  BookOpen,
  Layers,
  PlusCircle,
  Lightbulb,
  Trash2,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PageId, FlashcardItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState } from '../components/common/EmptyState';

interface FlashcardsPageProps {
  onNavigate: (page: PageId) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [deckList, setDeckList] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [selectedDeckFilter, setSelectedDeckFilter] = useState('All');

  // New Flashcard Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newDeck, setNewDeck] = useState('General');
  const [newHint, setNewHint] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch real flashcards from Firestore
  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'flashcards'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const list: FlashcardItem[] = [];
        snap.forEach((d) => {
          list.push(d.data() as FlashcardItem);
        });
        setDeckList(list);
      } catch (err) {
        console.warn('Could not load flashcards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [user]);

  // Unique deck list
  const availableDecks = ['All', ...Array.from(new Set(deckList.map((c) => c.deck || 'General')))];

  // Filtered cards
  const filteredCards =
    selectedDeckFilter === 'All'
      ? deckList
      : deckList.filter((c) => (c.deck || 'General') === selectedDeckFilter);

  const activeCard = filteredCards[currentIndex] || filteredCards[0];
  const progressPercent =
    filteredCards.length > 0 ? Math.round(((currentIndex + 1) / filteredCards.length) * 100) : 0;

  const knownCount = deckList.filter((c) => c.status === 'known').length;
  const needsPracticeCount = deckList.filter((c) => c.status === 'needs-practice').length;

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    const shuffled = [...deckList].sort(() => Math.random() - 0.5);
    setDeckList(shuffled);
    setCurrentIndex(0);
    onShowToast('Deck Shuffled', 'Cards randomized for spaced recall.', 'info');
  };

  const handleMarkCard = async (type: 'known' | 'needs-practice') => {
    if (!activeCard || !user) return;
    try {
      await updateDoc(doc(db, 'flashcards', activeCard.id), {
        status: type,
        updatedAt: new Date().toISOString(),
      });
      setDeckList((prev) =>
        prev.map((c) => (c.id === activeCard.id ? { ...c, status: type } : c))
      );
      if (type === 'known') {
        onShowToast('Marked as Known ✓', 'Moving to the next card.', 'success');
      } else {
        onShowToast('Needs Practice', 'Card queued for further review.', 'info');
      }
    } catch (err) {
      console.warn('Could not update card status:', err);
    }
    handleNext();
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'flashcards', cardId));
      setDeckList((prev) => prev.filter((c) => c.id !== cardId));
      if (currentIndex >= filteredCards.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      setIsFlipped(false);
      onShowToast('Card Deleted', 'Flashcard removed from your collection.', 'info');
    } catch (err) {
      onShowToast('Error', 'Could not delete flashcard.', 'error');
    }
  };

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onShowToast('Sign In Required', 'Please sign in to save flashcards.', 'warning');
      return;
    }
    if (!newFront.trim() || !newBack.trim()) {
      onShowToast('Incomplete', 'Please provide both front prompt and back answer.', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const cardId = 'fc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const nowIso = new Date().toISOString();

      const newCard: FlashcardItem = {
        id: cardId,
        userId: user.uid,
        deck: newDeck.trim() || 'General',
        front: newFront.trim(),
        back: newBack.trim(),
        hint: newHint.trim() || undefined,
        status: 'unreviewed',
        createdAt: nowIso,
      };

      await setDoc(doc(db, 'flashcards', cardId), newCard);
      setDeckList((prev) => [newCard, ...prev]);
      setShowAddModal(false);
      setNewFront('');
      setNewBack('');
      setNewHint('');
      onShowToast('Flashcard Created', `Added to deck "${newCard.deck}".`, 'success');
    } catch (err) {
      onShowToast('Error', 'Could not save flashcard. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E6DFFF] dark:bg-[#2B2144] text-[#9274E8] dark:text-[#A78BFA]">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              Smart Flashcards
            </h1>
          </div>
          <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
            Active recall & spaced repetition cards. Flip each card to test your retention.
          </p>
        </div>

        {/* Stats & Add Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-pastel-purple flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Flashcard</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#D5F5E3] dark:bg-[#1B362A] text-[#31966B] dark:text-[#34D399] flex items-center gap-1.5 border border-[#D5F5E3] dark:border-[#1B362A]">
            <Check className="w-3.5 h-3.5" /> {knownCount} Known
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#FFE2CC] dark:bg-[#3D291F] text-[#C95C1E] dark:text-[#FF8E72] flex items-center gap-1.5 border border-[#FFE2CC] dark:border-[#3D291F]">
            <RotateCw className="w-3.5 h-3.5" /> {needsPracticeCount} Need Practice
          </span>
        </div>

        {filteredCards.length > 0 && (
          <span className="text-[#777187] dark:text-[#A8A1BC]">
            Card {currentIndex + 1} of {filteredCards.length}
          </span>
        )}
      </div>

      {/* Deck Selector Filter */}
      {availableDecks.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-[#1F1930] rounded-2xl border border-[#E6DFFF] dark:border-[#332A4C] shadow-xs">
          {availableDecks.map((deck) => (
            <button
              key={deck}
              onClick={() => {
                setSelectedDeckFilter(deck);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedDeckFilter === deck
                  ? 'bg-[#E6DFFF] dark:bg-[#332A4C] text-[#352B48] dark:text-white font-bold'
                  : 'text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48] dark:hover:text-white'
              }`}
            >
              {deck}
            </button>
          ))}
        </div>
      )}

      {/* FLASHCARD STAGE */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#777187] dark:text-[#A8A1BC]">
          Loading flashcards...
        </div>
      ) : filteredCards.length === 0 ? (
        <EmptyState
          title="No flashcards found"
          description="Create your first study card to start mastering key concepts with active recall."
          actionLabel="Add Your First Flashcard"
          onAction={() => setShowAddModal(true)}
          icon={Layers}
        />
      ) : (
        <div className="space-y-4">
          {/* Card Container (3D Flip) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[280px] sm:min-h-[320px] bg-white dark:bg-[#1F1930] rounded-3xl border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft-lg p-6 sm:p-10 flex flex-col justify-between cursor-pointer transition-all hover:shadow-pastel-purple relative"
          >
            {/* Top Deck Label & Hint Toggle */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA] bg-[#E6DFFF] dark:bg-[#2B2144] px-2.5 py-1 rounded-lg">
                {activeCard.deck || 'General'} · {isFlipped ? 'Answer' : 'Question'}
              </span>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {activeCard.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-[11px] font-semibold text-[#777187] dark:text-[#A8A1BC] hover:text-[#9274E8] flex items-center gap-1 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-[#E0A020]" />
                    <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCard(activeCard.id)}
                  className="p-1.5 text-[#777187] hover:text-[#D95370] rounded-lg transition-colors cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Center Content */}
            <div className="py-8 text-center space-y-3">
              <p className="text-lg sm:text-2xl font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading leading-relaxed">
                {isFlipped ? activeCard.back : activeCard.front}
              </p>

              {showHint && !isFlipped && activeCard.hint && (
                <div className="p-3 bg-[#FFF1B8]/40 dark:bg-[#3D351A]/40 border border-[#FFF1B8] dark:border-[#3D351A] rounded-xl text-xs text-[#B8860B] dark:text-[#FDE047] max-w-md mx-auto">
                  💡 Hint: {activeCard.hint}
                </div>
              )}
            </div>

            {/* Bottom Flip Indicator */}
            <div className="text-center text-[11px] text-[#777187] dark:text-[#A8A1BC] flex items-center justify-center gap-1">
              <RotateCw className="w-3 h-3 text-[#9274E8]" />
              <span>Click card anywhere to flip</span>
            </div>
          </div>

          {/* Action Buttons: Known / Practice / Nav */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrev}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-[#1F1930] border border-[#E6DFFF] dark:border-[#332A4C] hover:bg-[#E6DFFF]/30 rounded-xl text-xs font-semibold text-[#352B48] dark:text-[#F5F1FD] flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-[#1F1930] border border-[#E6DFFF] dark:border-[#332A4C] hover:bg-[#E6DFFF]/30 rounded-xl text-xs font-semibold text-[#352B48] dark:text-[#F5F1FD] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleShuffle}
                className="p-2.5 bg-white dark:bg-[#1F1930] border border-[#E6DFFF] dark:border-[#332A4C] hover:bg-[#E6DFFF]/30 rounded-xl text-[#777187] dark:text-[#A8A1BC] cursor-pointer"
                title="Shuffle Deck"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleMarkCard('needs-practice')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#FFE2CC] dark:bg-[#3D291F] hover:bg-[#ffd2b3] text-[#C95C1E] dark:text-[#FF8E72] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Needs Practice</span>
              </button>
              <button
                onClick={() => handleMarkCard('known')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#D5F5E3] dark:bg-[#1B362A] hover:bg-[#bbf0d0] text-[#31966B] dark:text-[#34D399] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>I Know This</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW FLASHCARD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
              <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#9274E8]" />
                <span>Create New Flashcard</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#777187] hover:text-[#352B48] dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                  Deck / Topic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science & Biology or Vocabulary"
                  value={newDeck}
                  onChange={(e) => setNewDeck(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs text-[#352B48] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                  Front (Prompt / Term) <span className="text-[#D95370]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. What is the process by which plants convert light energy into glucose?"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs text-[#352B48] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                  Back (Answer / Definition) <span className="text-[#D95370]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Photosynthesis"
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs text-[#352B48] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                  Helpful Hint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photo- (light) + synthesis (put together)"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs text-[#352B48] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#777187] dark:text-[#A8A1BC] hover:bg-[#E6DFFF]/30 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-pastel-purple cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
