import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Shuffle, FastForward, ChevronRight, BarChart3, Search, Layers, GitFork, Info } from 'lucide-react';
import { sound } from '../services/audio';

export default function VisualizerSection() {
  const [activeVisualizer, setActiveVisualizer] = useState('sorting'); // sorting | binarySearch | stackQueue | bst

  return (
    <section className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Visualizer Category Sub-Tabs */}
      <div style={{
        padding: '10px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.25)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'sorting', label: 'Sorting Algorithms', icon: <BarChart3 size={14} /> },
            { id: 'binarySearch', label: 'Binary Search (O(log n))', icon: <Search size={14} /> },
            { id: 'stackQueue', label: 'Stack & Queue', icon: <Layers size={14} /> },
            { id: 'bst', label: 'Binary Search Tree', icon: <GitFork size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playPop();
                setActiveVisualizer(tab.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: activeVisualizer === tab.id ? 'var(--accent-primary)' : 'transparent',
                background: activeVisualizer === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeVisualizer === tab.id ? '#a5b4fc' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Info size={12} />
          <span>Interactive Canvas & Step Engine</span>
        </div>
      </div>

      {/* Visualizer Content Body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px' }}>
        {activeVisualizer === 'sorting' && <SortingVisualizer />}
        {activeVisualizer === 'binarySearch' && <BinarySearchVisualizer />}
        {activeVisualizer === 'stackQueue' && <StackQueueVisualizer />}
        {activeVisualizer === 'bst' && <BSTVisualizer />}
      </div>
    </section>
  );
}

/* =========================================================================
   1. SORTING VISUALIZER COMPONENT
   ========================================================================= */
function SortingVisualizer() {
  const [arraySize, setArraySize] = useState(24);
  const [speed, setSpeed] = useState(60); // ms
  const [algorithm, setAlgorithm] = useState('bubble'); // bubble | selection | insertion | quick
  const [array, setArray] = useState([]);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metrics, setMetrics] = useState({ comparisons: 0, swaps: 0, status: 'Ready' });

  const isRunningRef = useRef(false);

  // Generate random array
  const generateNewArray = (size = arraySize) => {
    isRunningRef.current = false;
    setIsPlaying(false);
    const newArr = [];
    for (let i = 0; i < size; i++) {
      newArr.push(Math.floor(Math.random() * 85) + 12);
    }
    setArray(newArr);
    setComparing([]);
    setSwapping([]);
    setSortedIndices([]);
    setMetrics({ comparisons: 0, swaps: 0, status: 'Array randomized. Press Play.' });
  };

  useEffect(() => {
    generateNewArray(arraySize);
  }, [arraySize]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Run Sorting
  const runSort = async () => {
    if (isPlaying) {
      isRunningRef.current = false;
      setIsPlaying(false);
      return;
    }

    isRunningRef.current = true;
    setIsPlaying(true);
    let comps = 0;
    let swaps = 0;
    const arr = [...array];

    if (algorithm === 'bubble') {
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (!isRunningRef.current) return;
          setComparing([j, j + 1]);
          comps++;
          setMetrics(m => ({ ...m, comparisons: comps, status: `Comparing ${arr[j]} and ${arr[j + 1]}` }));
          await sleep(speed);

          if (arr[j] > arr[j + 1]) {
            setSwapping([j, j + 1]);
            swaps++;
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            setArray([...arr]);
            sound.playPop();
            await sleep(speed);
          }
        }
        setSortedIndices(prev => [...prev, n - i - 1]);
      }
      setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    } else if (algorithm === 'selection') {
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          if (!isRunningRef.current) return;
          setComparing([minIdx, j]);
          comps++;
          setMetrics(m => ({ ...m, comparisons: comps, status: `Searching for minimum element. Current min: ${arr[minIdx]}` }));
          await sleep(speed);

          if (arr[j] < arr[minIdx]) {
            minIdx = j;
          }
        }
        if (minIdx !== i) {
          setSwapping([i, minIdx]);
          swaps++;
          const temp = arr[i];
          arr[i] = arr[minIdx];
          arr[minIdx] = temp;
          setArray([...arr]);
          sound.playPop();
          await sleep(speed);
        }
        setSortedIndices(prev => [...prev, i]);
      }
      setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    } else if (algorithm === 'insertion') {
      const n = arr.length;
      setSortedIndices([0]);
      for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
          if (!isRunningRef.current) return;
          comps++;
          setComparing([j, j + 1]);
          setMetrics(m => ({ ...m, comparisons: comps, status: `Shifting element ${arr[j]} > ${key}` }));
          arr[j + 1] = arr[j];
          swaps++;
          setArray([...arr]);
          sound.playPop();
          await sleep(speed);
          j--;
        }
        arr[j + 1] = key;
        setArray([...arr]);
        setSortedIndices(Array.from({ length: i + 1 }, (_, idx) => idx));
      }
    }

    setComparing([]);
    setSwapping([]);
    setIsPlaying(false);
    isRunningRef.current = false;
    sound.playSuccess();
    setMetrics(m => ({ ...m, status: `✨ Finished! Sorted in ${comps} comparisons and ${swaps} swaps.` }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Algorithm Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Algorithm:</span>
          <select
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value);
              generateNewArray();
            }}
            disabled={isPlaying}
            className="glass-input"
            style={{ padding: '6px 10px', fontSize: '13px', background: '#0f172a' }}
          >
            <option value="bubble">Bubble Sort (O(n²))</option>
            <option value="selection">Selection Sort (O(n²))</option>
            <option value="insertion">Insertion Sort (O(n²))</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={runSort}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Start Sort'}</span>
          </button>

          <button
            onClick={() => generateNewArray()}
            disabled={isPlaying}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '13px' }}
            title="Randomize Array"
          >
            <Shuffle size={14} />
            <span>Randomize</span>
          </button>
        </div>

        {/* Sliders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <span>Speed:</span>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={210 - speed}
              onChange={(e) => setSpeed(210 - Number(e.target.value))}
              disabled={isPlaying}
              style={{ width: '80px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <span>Size:</span>
            <input
              type="range"
              min="12"
              max="36"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isPlaying}
              style={{ width: '80px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

      {/* Metrics Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div>{metrics.status}</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Comparisons: <strong style={{ color: 'var(--accent-amber)' }}>{metrics.comparisons}</strong></span>
          <span>Swaps: <strong style={{ color: 'var(--accent-rose)' }}>{metrics.swaps}</strong></span>
        </div>
      </div>

      {/* Dynamic Animated Bars */}
      <div style={{
        flex: 1,
        minHeight: '260px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '4px',
        padding: '20px 10px',
        background: 'rgba(10, 15, 26, 0.7)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {array.map((val, idx) => {
          const isComp = comparing.includes(idx);
          const isSwap = swapping.includes(idx);
          const isSorted = sortedIndices.includes(idx);

          let barBg = 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)';
          let barBorder = 'rgba(99, 102, 241, 0.4)';
          let shadow = 'none';

          if (isSwap) {
            barBg = 'linear-gradient(180deg, #f43f5e 0%, #be123c 100%)';
            barBorder = 'rgba(244, 63, 94, 0.8)';
            shadow = '0 0 12px rgba(244, 63, 94, 0.6)';
          } else if (isComp) {
            barBg = 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)';
            barBorder = 'rgba(245, 158, 11, 0.8)';
            shadow = '0 0 12px rgba(245, 158, 11, 0.6)';
          } else if (isSorted) {
            barBg = 'linear-gradient(180deg, #10b981 0%, #047857 100%)';
            barBorder = 'rgba(16, 185, 129, 0.8)';
          }

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                maxWidth: '36px',
                height: `${val}%`,
                background: barBg,
                borderRadius: '4px 4px 0 0',
                border: `1px solid ${barBorder}`,
                boxShadow: shadow,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '4px',
                color: '#fff',
                fontSize: arraySize > 25 ? '9px' : '11px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                transition: 'height 0.1s ease, background 0.15s ease',
                userSelect: 'none'
              }}
            >
              {val}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', background: '#6366f1', borderRadius: '2px' }} /> Default
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }} /> Comparing
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', background: '#f43f5e', borderRadius: '2px' }} /> Swapping
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} /> Sorted
        </span>
      </div>
    </div>
  );
}

/* =========================================================================
   2. BINARY SEARCH VISUALIZER
   ========================================================================= */
function BinarySearchVisualizer() {
  const [list] = useState([3, 7, 12, 19, 24, 31, 38, 45, 52, 60, 68, 77, 85, 93, 102, 115]);
  const [target, setTarget] = useState(52);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(15);
  const [mid, setMid] = useState(null);
  const [foundIndex, setFoundIndex] = useState(null);
  const [stepLogs, setStepLogs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const resetSearch = (newTarget = target) => {
    setLow(0);
    setHigh(list.length - 1);
    setMid(null);
    setFoundIndex(null);
    setStepLogs([`Initialized search range: [0, ${list.length - 1}]. Target is ${newTarget}.`]);
    setIsSearching(false);
  };

  const handleStep = () => {
    if (foundIndex !== null) return;
    if (low > high) {
      sound.playRoast();
      setStepLogs(prev => [...prev, `Target ${target} not found in array! Binary Search completed in O(log n).`]);
      return;
    }

    const currentMid = Math.floor((low + high) / 2);
    setMid(currentMid);
    sound.playPop();

    if (list[currentMid] === target) {
      sound.playSuccess();
      setFoundIndex(currentMid);
      setStepLogs(prev => [...prev, `🎯 MATCH FOUND at index ${currentMid}! list[${currentMid}] === ${target}`]);
    } else if (list[currentMid] < target) {
      setStepLogs(prev => [...prev, `list[${currentMid}]=${list[currentMid]} < target ${target} ➔ Discard left half. Move low = ${currentMid + 1}`]);
      setLow(currentMid + 1);
    } else {
      setStepLogs(prev => [...prev, `list[${currentMid}]=${list[currentMid]} > target ${target} ➔ Discard right half. Move high = ${currentMid - 1}`]);
      setHigh(currentMid - 1);
    }
  };

  const handleAutoRun = async () => {
    resetSearch(target);
    setIsSearching(true);
    let l = 0;
    let r = list.length - 1;

    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      setLow(l);
      setHigh(r);
      setMid(m);
      sound.playPop();

      if (list[m] === target) {
        sound.playSuccess();
        setFoundIndex(m);
        setStepLogs(prev => [...prev, `🎯 MATCH FOUND at index ${m}! (${target})`]);
        setIsSearching(false);
        return;
      } else if (list[m] < target) {
        setStepLogs(prev => [...prev, `list[${m}]=${list[m]} < ${target} ➔ search right half`]);
        l = m + 1;
      } else {
        setStepLogs(prev => [...prev, `list[${m}]=${list[m]} > ${target} ➔ search left half`]);
        r = m - 1;
      }
      await new Promise(res => setTimeout(res, 800));
    }

    sound.playRoast();
    setStepLogs(prev => [...prev, `Element ${target} not found.`]);
    setIsSearching(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Target Value:</span>
          <input
            type="number"
            value={target}
            onChange={(e) => {
              const val = Number(e.target.value);
              setTarget(val);
              resetSearch(val);
            }}
            className="glass-input"
            style={{ width: '80px', padding: '6px 10px', fontSize: '13px', textAlign: 'center' }}
          />
          <button
            onClick={() => {
              const rand = list[Math.floor(Math.random() * list.length)];
              setTarget(rand);
              resetSearch(rand);
            }}
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            Pick From Array
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleStep}
            disabled={isSearching || foundIndex !== null}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            <ChevronRight size={14} />
            <span>Next Step</span>
          </button>

          <button
            onClick={handleAutoRun}
            disabled={isSearching}
            className="btn btn-emerald"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            <Play size={14} />
            <span>Auto Run</span>
          </button>

          <button
            onClick={() => resetSearch()}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Sorted Array Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '24px 12px',
        background: 'rgba(10, 15, 26, 0.7)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflowX: 'auto'
      }}>
        {list.map((num, idx) => {
          const isMid = idx === mid;
          const isLow = idx === low;
          const isHigh = idx === high;
          const isMatch = idx === foundIndex;
          const isOutOfRange = idx < low || idx > high;

          let bg = 'rgba(255, 255, 255, 0.05)';
          let border = 'rgba(255, 255, 255, 0.1)';
          let color = '#fff';

          if (isMatch) {
            bg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            border = 'var(--accent-emerald)';
          } else if (isMid) {
            bg = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
            border = '#c084fc';
          } else if (isOutOfRange) {
            bg = 'rgba(255, 255, 255, 0.01)';
            color = 'var(--text-dim)';
            border = 'transparent';
          }

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              {/* Pointer Markers */}
              <div style={{ height: '20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {isMid && <span style={{ color: '#c084fc' }}>MID</span>}
                {!isMid && isLow && <span style={{ color: 'var(--accent-cyan)' }}>LOW</span>}
                {!isMid && isHigh && <span style={{ color: 'var(--accent-amber)' }}>HIGH</span>}
              </div>

              {/* Cell */}
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: bg,
                border: `2px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                color,
                boxShadow: isMatch ? '0 0 16px var(--accent-emerald-glow)' : isMid ? '0 0 16px var(--accent-primary-glow)' : 'none',
                transition: 'all 0.25s'
              }}>
                {num}
              </div>

              {/* Index label */}
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Step Explanation Logs */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        maxHeight: '140px',
        overflowY: 'auto'
      }}>
        {stepLogs.map((log, i) => (
          <div key={i} style={{ color: i === stepLogs.length - 1 ? '#a5f3fc' : 'var(--text-dim)', marginBottom: '4px' }}>
            ❯ {log}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   3. STACK & QUEUE VISUALIZER
   ========================================================================= */
function StackQueueVisualizer() {
  const [mode, setMode] = useState('stack'); // stack | queue
  const [items, setItems] = useState([10, 20, 30]);
  const [inputVal, setInputVal] = useState(40);
  const [alertMsg, setAlertMsg] = useState('');

  const handlePush = () => {
    if (items.length >= 8) {
      sound.playRoast();
      setAlertMsg('Stack Overflow! Capacity limit (8) reached.');
      return;
    }
    sound.playPop();
    setItems(prev => mode === 'stack' ? [...prev, inputVal] : [...prev, inputVal]);
    setInputVal(v => v + 10);
    setAlertMsg(`${mode === 'stack' ? 'Pushed' : 'Enqueued'} item: ${inputVal}`);
  };

  const handlePop = () => {
    if (items.length === 0) {
      sound.playRoast();
      setAlertMsg('Underflow! Data structure is already empty.');
      return;
    }
    sound.playPop();
    const removed = mode === 'stack' ? items[items.length - 1] : items[0];
    setItems(prev => mode === 'stack' ? prev.slice(0, -1) : prev.slice(1));
    setAlertMsg(`${mode === 'stack' ? 'Popped' : 'Dequeued'} element: ${removed}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Mode Selector and Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => { setMode('stack'); sound.playPop(); }}
            className={`btn ${mode === 'stack' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            Stack (LIFO)
          </button>
          <button
            onClick={() => { setMode('queue'); sound.playPop(); }}
            className={`btn ${mode === 'queue' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            Queue (FIFO)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(Number(e.target.value))}
            className="glass-input"
            style={{ width: '70px', padding: '6px 10px', fontSize: '13px', textAlign: 'center' }}
          />

          <button
            onClick={handlePush}
            className="btn btn-emerald"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            {mode === 'stack' ? 'Push()' : 'Enqueue()'}
          </button>

          <button
            onClick={handlePop}
            className="btn btn-danger"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            {mode === 'stack' ? 'Pop()' : 'Dequeue()'}
          </button>
        </div>
      </div>

      {alertMsg && (
        <div style={{ fontSize: '12px', color: 'var(--accent-amber)', padding: '0 4px' }}>
          🔔 {alertMsg}
        </div>
      )}

      {/* Visual Container */}
      <div style={{
        minHeight: '260px',
        background: 'rgba(10, 15, 26, 0.7)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        {mode === 'stack' ? (
          /* Vertical Stack Container */
          <div style={{
            width: '180px',
            borderBottom: '3px solid var(--accent-primary)',
            borderLeft: '3px solid var(--accent-primary)',
            borderRight: '3px solid var(--accent-primary)',
            borderRadius: '0 0 12px 12px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '6px',
            minHeight: '220px',
            background: 'rgba(99, 102, 241, 0.05)'
          }}>
            {items.map((val, idx) => (
              <div
                key={idx}
                className="animate-fade-in"
                style={{
                  height: '36px',
                  background: idx === items.length - 1
                    ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                    : 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  fontWeight: 600,
                  fontSize: '13px',
                  boxShadow: idx === items.length - 1 ? '0 0 12px var(--accent-primary-glow)' : 'none'
                }}
              >
                <span>{val}</span>
                {idx === items.length - 1 && (
                  <span style={{ fontSize: '10px', color: '#fff', fontWeight: 800 }}>← TOP</span>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', marginTop: '80px' }}>
                Empty Stack
              </div>
            )}
          </div>
        ) : (
          /* Horizontal Queue Tube */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderTop: '2px dashed var(--accent-cyan)',
            borderBottom: '2px dashed var(--accent-cyan)',
            padding: '16px 20px',
            minWidth: '320px',
            background: 'rgba(6, 182, 212, 0.04)',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-rose)', fontWeight: 700 }}>FRONT (EXIT) ➔</span>
            {items.map((val, idx) => (
              <div
                key={idx}
                className="animate-fade-in"
                style={{
                  width: '44px',
                  height: '44px',
                  background: idx === 0 ? 'var(--accent-rose)' : 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                {val}
              </div>
            ))}
            {items.length === 0 && (
              <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Empty Queue</span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>➔ REAR (ENTER)</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   4. BINARY SEARCH TREE (BST) VISUALIZER
   ========================================================================= */
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function BSTVisualizer() {
  const [root, setRoot] = useState(null);
  const [insertVal, setInsertVal] = useState(25);
  const [traversalResult, setTraversalResult] = useState('');

  // Initial starter tree
  useEffect(() => {
    let r = new TreeNode(50);
    r.left = new TreeNode(30);
    r.right = new TreeNode(70);
    r.left.left = new TreeNode(20);
    r.left.right = new TreeNode(40);
    r.right.left = new TreeNode(60);
    r.right.right = new TreeNode(80);
    setRoot(r);
  }, []);

  const insertNode = (node, val) => {
    if (!node) return new TreeNode(val);
    if (val < node.val) {
      node.left = insertNode(node.left, val);
    } else if (val > node.val) {
      node.right = insertNode(node.right, val);
    }
    return node;
  };

  const handleInsert = () => {
    if (!insertVal) return;
    sound.playPop();
    const cloned = cloneTree(root);
    const newRoot = insertNode(cloned, Number(insertVal));
    setRoot(newRoot);
    setInsertVal(v => (v + 7) % 99 + 1);
  };

  const cloneTree = (node) => {
    if (!node) return null;
    const n = new TreeNode(node.val);
    n.left = cloneTree(node.left);
    n.right = cloneTree(node.right);
    return n;
  };

  const handleInorder = () => {
    sound.playSuccess();
    const res = [];
    const inorder = (node) => {
      if (!node) return;
      inorder(node.left);
      res.push(node.val);
      inorder(node.right);
    };
    inorder(root);
    setTraversalResult(`In-Order (Sorted): [ ${res.join(' ➔ ')} ]`);
  };

  // Convert tree into SVG coordinate nodes
  const renderTreeSVG = () => {
    if (!root) return null;
    const nodes = [];
    const links = [];

    const traverse = (node, x, y, dx) => {
      if (!node) return;
      nodes.push({ val: node.val, x, y });

      if (node.left) {
        links.push({ x1: x, y1: y, x2: x - dx, y2: y + 55 });
        traverse(node.left, x - dx, y + 55, dx / 1.9);
      }
      if (node.right) {
        links.push({ x1: x, y1: y, x2: x + dx, y2: y + 55 });
        traverse(node.right, x + dx, y + 55, dx / 1.9);
      }
    };

    traverse(root, 280, 40, 110);

    return (
      <svg width="100%" height="280" viewBox="0 0 560 280" style={{ overflow: 'visible' }}>
        {/* Branch Lines */}
        {links.map((l, i) => (
          <line
            key={`l-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
          />
        ))}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={`n-${i}`} transform={`translate(${n.x}, ${n.y})`}>
            <circle
              r="18"
              fill="var(--bg-surface-elevated)"
              stroke="var(--accent-primary)"
              strokeWidth="2.5"
              filter="drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))"
            />
            <text
              textAnchor="middle"
              dy=".3em"
              fill="#fff"
              fontSize="12"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {n.val}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            value={insertVal}
            onChange={(e) => setInsertVal(Number(e.target.value))}
            className="glass-input"
            style={{ width: '70px', padding: '6px 10px', fontSize: '13px', textAlign: 'center' }}
          />
          <button
            onClick={handleInsert}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            Insert Node
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleInorder}
            className="btn btn-emerald"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            Run In-Order Traversal
          </button>

          <button
            onClick={() => { setRoot(new TreeNode(50)); sound.playPop(); }}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            Reset Tree
          </button>
        </div>
      </div>

      {traversalResult && (
        <div style={{
          padding: '8px 14px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: '#6ee7b7'
        }}>
          {traversalResult}
        </div>
      )}

      {/* SVG Canvas Tree Render */}
      <div style={{
        background: 'rgba(10, 15, 26, 0.7)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        padding: '10px',
        minHeight: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {renderTreeSVG()}
      </div>
    </div>
  );
}
