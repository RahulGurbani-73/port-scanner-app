import React, { useState, useEffect } from 'react';
import { Shield, Zap, Target, AlertCircle, Copy, Download, Sun, Moon, Play, Pause, X } from 'lucide-react';

const PortScanner = () => {
  const [target, setTarget] = useState('192.168.1.1');
  const [portRange, setPortRange] = useState({ start: 1, end: 1024 });
  const [scanType, setScanType] = useState('tcp');
  const [scanning, setScanning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [openPorts, setOpenPorts] = useState([]);
  const [scanTime, setScanTime] = useState(0);
  const [scanIntervalId, setScanIntervalId] = useState(null);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState('port');
  const [sortOrder, setSortOrder] = useState('asc');
  const [darkMode, setDarkMode] = useState(true);

  const validateInputs = () => {
    setError('');
    
    // Basic validation for target
    if (!target || target.trim() === '') {
      setError('Target IP/Hostname is required.');
      return false;
    }
    
    // Validate port range
    if (portRange.start < 1 || portRange.end > 65535) {
      setError('Ports must be between 1 and 65535.');
      return false;
    }
    
    if (portRange.start > portRange.end) {
      setError('Start port must be less than or equal to end port.');
      return false;
    }
    
    return true;
  };

  // Simulate port scanning
  const startScan = () => {
    if (scanning && !paused) return;
    
    if (!scanning && !validateInputs()) return;
    
    if (paused) {
      // Resume scan
      setPaused(false);
      return;
    }
    
    // Start new scan
    setScanning(true);
    setPaused(false);
    setResults([]);
    setOpenPorts([]);
    setProgress(0);
    setScanTime(0);
    setError('');
    
    const startTime = Date.now();
    const totalPorts = portRange.end - portRange.start + 1;
    const simulatedOpenPorts = [22, 80, 443, 8080, 21, 53]; // Common open ports
    
    // Simulate scanning each port
    let currentPort = portRange.start;
    
    const intervalId = setInterval(() => {
      if (paused) return;
      
      setProgress(prev => {
        const newProgress = ((currentPort - portRange.start + 1) / totalPorts) * 100;
        
        // Randomly find some open ports during the scan
        if (Math.random() > 0.9 && simulatedOpenPorts.length > 0) {
          const portIndex = Math.floor(Math.random() * simulatedOpenPorts.length);
          const port = simulatedOpenPorts[portIndex];
          
          if (port >= portRange.start && port <= portRange.end && !openPorts.includes(port)) {
            const newResult = {
              port,
              status: 'open',
              service: getServiceName(port),
              timestamp: new Date().toLocaleTimeString()
            };
            
            setResults(prev => [...prev, newResult]);
            setOpenPorts(prev => [...prev, port]);
          }
        }
        
        // Also simulate some closed ports
        if (Math.random() > 0.7 && currentPort % 10 === 0) {
          const closedPortResult = {
            port: currentPort,
            status: 'closed',
            service: getServiceName(currentPort),
            timestamp: new Date().toLocaleTimeString()
          };
          
          setResults(prev => [...prev, closedPortResult]);
        }
        
        currentPort++;
        
        if (currentPort > portRange.end) {
          clearInterval(intervalId);
          setScanning(false);
          setScanTime((Date.now() - startTime) / 1000);
          return 100;
        }
        
        return newProgress;
      });
    }, 50);
    
    setScanIntervalId(intervalId);
  };

  const pauseScan = () => {
    setPaused(true);
  };

  const cancelScan = () => {
    if (scanIntervalId) {
      clearInterval(scanIntervalId);
    }
    setScanning(false);
    setPaused(false);
    setProgress(0);
  };

  const getServiceName = (port) => {
    const portServices = {
      21: 'FTP',
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      993: 'IMAPS',
      995: 'POP3S',
      1433: 'MSSQL',
      3306: 'MySQL',
      3389: 'RDP',
      5432: 'PostgreSQL',
      6379: 'Redis',
      8080: 'HTTP-Alt',
      27017: 'MongoDB'
    };
    
    return portServices[port] || 'Unknown';
  };

  const exportResults = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `portscan-${target}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyResults = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    alert('Results copied to clipboard!');
  };

  // Filter and sort results
  const filteredResults = results.filter(result => {
    if (filterStatus === 'all') return true;
    return result.status === filterStatus;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortKey === 'port') {
      return sortOrder === 'asc' ? a.port - b.port : b.port - a.port;
    } else if (sortKey === 'service') {
      return sortOrder === 'asc' 
        ? a.service.localeCompare(b.service) 
        : b.service.localeCompare(a.service);
    } else if (sortKey === 'status') {
      return sortOrder === 'asc' 
        ? a.status.localeCompare(b.status) 
        : b.status.localeCompare(a.status);
    }
    return 0;
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-200';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-300';
  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-6 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold">CyberShield Port Scanner</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">v1.1.0</div>
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-3 rounded-md bg-red-900 text-red-100 ${borderColor} border`}>
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className={`lg:col-span-1 ${cardBg} rounded-lg p-6 ${borderColor} border`}>
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Scan Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target IP/Hostname</label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className={`w-full ${inputBg} border ${borderColor} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter target IP or hostname"
                  disabled={scanning && !paused}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Port</label>
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={portRange.start}
                    onChange={(e) => setPortRange({...portRange, start: parseInt(e.target.value) || 1})}
                    className={`w-full ${inputBg} border ${borderColor} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    disabled={scanning && !paused}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Port</label>
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={portRange.end}
                    onChange={(e) => setPortRange({...portRange, end: parseInt(e.target.value) || 1})}
                    className={`w-full ${inputBg} border ${borderColor} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    disabled={scanning && !paused}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Scan Type</label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  className={`w-full ${inputBg} border ${borderColor} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  disabled={scanning && !paused}
                >
                  <option value="tcp">TCP Connect</option>
                  <option value="syn">SYN (Stealth) Scan</option>
                  <option value="udp">UDP Scan</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={startScan}
                  disabled={scanning && !paused}
                  className={`flex-1 py-3 rounded-md font-medium flex items-center justify-center ${
                    scanning && !paused 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-colors`}
                >
                  {scanning ? (
                    paused ? (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Scanning...
                      </>
                    )
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Start Scan
                    </>
                  )}
                </button>
                
                {scanning && (
                  <>
                    {!paused ? (
                      <button
                        onClick={pauseScan}
                        className="p-3 bg-yellow-600 hover:bg-yellow-700 rounded-md flex items-center justify-center transition-colors"
                        title="Pause scan"
                      >
                        <Pause className="h-5 w-5" />
                      </button>
                    ) : null}
                    
                    <button
                      onClick={cancelScan}
                      className="p-3 bg-red-600 hover:bg-red-700 rounded-md flex items-center justify-center transition-colors"
                      title="Cancel scan"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              
              {scanning && (
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className={`w-full ${inputBg} rounded-full h-2.5`}>
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {scanTime > 0 && (
              <div className={`mt-6 p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-200'} rounded-md`}>
                <h3 className="font-medium mb-2">Scan Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-mono">{target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ports scanned:</span>
                    <span>{portRange.start}-{portRange.end}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Open ports found:</span>
                    <span className="text-green-400">{openPorts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closed ports found:</span>
                    <span className="text-red-400">{results.filter(r => r.status === 'closed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scan duration:</span>
                    <span>{scanTime.toFixed(2)} seconds</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={copyResults}
                    className={`flex items-center justify-center text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} px-3 py-2 rounded-md flex-1 transition-colors`}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={exportResults}
                    className={`flex items-center justify-center text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} px-3 py-2 rounded-md flex-1 transition-colors`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Results Panel */}
          <div className={`lg:col-span-2 ${cardBg} rounded-lg p-6 ${borderColor} border`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center mb-4 sm:mb-0">
                <AlertCircle className="h-5 w-5 mr-2" />
                Scan Results
              </h2>
              
              {results.length > 0 && (
                <div className="flex space-x-2">
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`${inputBg} border ${borderColor} rounded-md px-3 py-2 text-sm`}
                  >
                    <option value="all">All Ports</option>
                    <option value="open">Open Only</option>
                    <option value="closed">Closed Only</option>
                  </select>
                  
                  <select 
                    value={sortKey} 
                    onChange={(e) => setSortKey(e.target.value)}
                    className={`${inputBg} border ${borderColor} rounded-md px-3 py-2 text-sm`}
                  >
                    <option value="port">Sort by Port</option>
                    <option value="service">Sort by Service</option>
                    <option value="status">Sort by Status</option>
                  </select>
                  
                  <button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`${inputBg} border ${borderColor} rounded-md px-3 py-2 text-sm`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              )}
            </div>
            
            {sortedResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${borderColor}`}>
                      <th className="text-left py-3 px-4">Port</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Service</th>
                      <th className="text-left py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((result, index) => (
                      <tr key={index} className={`border-b ${borderColor} hover:${darkMode ? 'bg-gray-750' : 'bg-gray-100'}`}>
                        <td className="py-3 px-4 font-mono">{result.port}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            result.status === 'open' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{result.service}</td>
                        <td className="py-3 px-4 text-sm text-gray-400">{result.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : scanning ? (
              <div className="text-center py-12">
                <div className={`inline-flex items-center justify-center p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-200'} rounded-full mb-4`}>
                  <Zap className="h-8 w-8 text-green-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-medium mb-2">Scan {paused ? 'Paused' : 'in Progress'}</h3>
                <p className={mutedText}>Scanning ports {portRange.start} to {portRange.end}</p>
                {paused && (
                  <p className={`mt-2 ${mutedText}`}>Click Resume to continue scanning</p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`inline-flex items-center justify-center p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-200'} rounded-full mb-4`}>
                  <Target className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No scan results yet</h3>
                <p className={mutedText}>Configure your scan and click "Start Scan" to begin</p>
              </div>
            )}
            
            {/* Port Visualization */}
            {openPorts.length > 0 && (
              <div className="mt-8">
                <h3 className="font-medium mb-4">Open Ports Visualization</h3>
                <div className="flex flex-wrap gap-2">
                  {openPorts.map((port, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-mono"
                    >
                      {port}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Use this tool responsibly and only on networks you have permission to scan.</p>
        </div>
      </div>
    </div>
  );
};

export default PortScanner;                                                                                                                                   