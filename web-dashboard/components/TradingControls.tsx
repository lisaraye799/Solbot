'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Square, Settings, Search, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface TradingControlsProps {
  isTrading: boolean
  onTradingChange: (trading: boolean) => void
}

export function TradingControls({ isTrading, onTradingChange }: TradingControlsProps) {
  const [tokenAddress, setTokenAddress] = useState('')
  const [strategy, setStrategy] = useState('volume_only')
  const [walletCount, setWalletCount] = useState(5)
  const [solAmount, setSolAmount] = useState(0.1)
  const [isValidating, setIsValidating] = useState(false)
  const [tokenInfo, setTokenInfo] = useState(null)

  const validateToken = async () => {
    if (!tokenAddress) return
    
    setIsValidating(true)
    try {
      const response = await fetch('http://localhost:3001/api/tokens/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddress }),
      })
      
      const data = await response.json()
      
      if (data.valid && data.tokenInfo) {
        setTokenInfo(data.tokenInfo)
        toast.success('Token validated successfully!')
      } else {
        toast.error(data.error || 'Invalid token address')
        setTokenInfo(null)
      }
    } catch (error) {
      console.error('Token validation error:', error)
      toast.error('Failed to validate token')
      setTokenInfo(null)
    } finally {
      setIsValidating(false)
    }
  }

  const startTrading = async () => {
    if (!tokenAddress || !tokenInfo) {
      toast.error('Please validate a token first')
      return
    }

    try {
      // Simulate starting trading session
      await new Promise(resolve => setTimeout(resolve, 1000))
      onTradingChange(true)
      toast.success('Trading session started!')
    } catch (error) {
      toast.error('Failed to start trading')
    }
  }

  const pauseTrading = () => {
    onTradingChange(false)
    toast.success('Trading paused')
  }

  const stopTrading = () => {
    onTradingChange(false)
    setTokenInfo(null)
    setTokenAddress('')
    toast.success('Trading stopped')
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Trading Controls</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isTrading ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm text-gray-300">
            {isTrading ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token Address
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="Enter Solana token address..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isTrading}
            />
            <button
              onClick={validateToken}
              disabled={isValidating || isTrading || !tokenAddress}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              {isValidating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Validate</span>
            </button>
          </div>
          
          {tokenInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center space-x-2 text-green-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Token Validated</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white ml-2">{tokenInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Symbol:</span>
                  <span className="text-white ml-2">{tokenInfo.symbol}</span>
                </div>
                <div>
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white ml-2">{tokenInfo.price}</span>
                </div>
                <div>
                  <span className="text-gray-400">24h Volume:</span>
                  <span className="text-white ml-2">{tokenInfo.volume24h}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Strategy Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Trading Strategy
          </label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            disabled={isTrading}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="volume_only">Volume Only</option>
            <option value="makers_volume">Makers + Volume</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {strategy === 'volume_only' 
              ? 'Focus purely on generating trading volume'
              : 'Create market depth while generating volume'
            }
          </p>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Wallets
            </label>
            <input
              type="number"
              value={walletCount}
              onChange={(e) => setWalletCount(Number(e.target.value))}
              min="1"
              max="20"
              disabled={isTrading}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SOL Amount
            </label>
            <input
              type="number"
              value={solAmount}
              onChange={(e) => setSolAmount(Number(e.target.value))}
              min="0.01"
              step="0.01"
              disabled={isTrading}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Fee Information */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Estimated fee per transaction:</span>
            <span className="text-blue-400 font-semibold">0.001 SOL</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-300">Free trades remaining:</span>
            <span className="text-green-400 font-semibold">8</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-3">
          {!isTrading ? (
            <button
              onClick={startTrading}
              disabled={!tokenInfo}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Start Trading</span>
            </button>
          ) : (
            <>
              <button
                onClick={pauseTrading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
              <button
                onClick={stopTrading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}