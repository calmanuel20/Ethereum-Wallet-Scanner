'use client'

interface AllHoldingsModalProps {
  holdings: any[]
  isOpen: boolean
  onClose: () => void
}

export default function AllHoldingsModal({
  holdings,
  isOpen,
  onClose,
}: AllHoldingsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">All Portfolio Holdings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-800">
                  <th className="pb-3 text-gray-400 font-medium text-sm">#</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Token</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Balance</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Price (USD)</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((balance: any, index: number) => (
                    <tr
                      key={balance.contractAddress || index}
                      className="border-b border-gray-800 hover:bg-gray-800/50"
                    >
                      <td className="py-3 text-gray-400 text-sm">{index + 1}</td>
                      <td className="py-3 text-white">
                        <div className="font-medium">{balance.symbol}</div>
                        <div className="text-sm text-gray-400">{balance.name}</div>
                      </td>
                      <td className="py-3 text-white text-sm">
                        {balance.balance.toLocaleString('en-US', {
                          maximumFractionDigits: 6,
                        })}
                      </td>
                      <td className="py-3 text-white text-sm">
                        {balance.price > 0
                          ? `$${balance.price.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : 'N/A'}
                      </td>
                      <td className="py-3 text-white font-medium text-sm">
                        {balance.value > 0
                          ? `$${balance.value.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

