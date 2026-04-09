'use client'

import React, { useState } from 'react'
import { 
    CreditCard, 
    Smartphone, 
    CheckCircle2, 
    Loader2, 
    IndianRupee, 
    ShieldCheck,
    X,
    ArrowRight
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { processTransaction } from '@/app/dashboard/billing/actions'
import { useToast } from '@/hooks/use-toast'

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    billingId: string
    amount: number
    patientName: string
}

export function PaymentModal({ isOpen, onClose, billingId, amount, patientName }: PaymentModalProps) {
    const { toast } = useToast()
    const [method, setMethod] = useState<'CARD' | 'UPI' | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handlePayment = async () => {
        if (!method) return
        
        setIsProcessing(true)
        try {
            // Simulate gateway delay
            await new Promise(r => setTimeout(r, 2000))
            
            const txnId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
            const result = await processTransaction(billingId, method, txnId)
            
            if (result.success) {
                setIsSuccess(true)
                toast({
                    title: "Payment Successful",
                    description: "Payment has been processed correctly.",
                })
            } else {
                toast({
                    title: "Payment Failed",
                    description: result.error || 'Payment failed',
                    variant: "destructive"
                })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    if (isSuccess) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="glass-card border-none max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
                    <div className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Transaction <span className="text-emerald-400 italic">Confirmed</span></h3>
                    <p className="text-blue-100/40 text-sm font-medium mb-8">
                        Receipt for {patientName} has been generated and sent to the patient portal.
                    </p>
                    <Button 
                        onClick={onClose}
                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        Return to Billing
                    </Button>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass-card border-none max-w-md p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 pb-0">
                    <DialogHeader>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest mb-2">Secure Gateway</Badge>
                                <DialogTitle className="text-2xl font-black text-white">Complete <span className="text-primary italic">Checkout</span></DialogTitle>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <X className="h-5 w-5 text-blue-100/20" />
                            </button>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 mb-8">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest">Total Amount</span>
                                <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest">Patient</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <h2 className="text-3xl font-black text-white flex items-center gap-1 leading-none tracking-tighter">
                                    <IndianRupee className="h-6 w-6 text-primary" />
                                    {amount.toLocaleString()}
                                </h2>
                                <p className="text-sm font-bold text-white leading-none">{patientName}</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 mb-8">
                        <p className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest ml-1">Payment Method</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setMethod('CARD')}
                                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 group
                                    ${method === 'CARD' ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                `}
                            >
                                <CreditCard className={`h-6 w-6 ${method === 'CARD' ? 'text-primary' : 'text-blue-100/20 group-hover:text-blue-100/40'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${method === 'CARD' ? 'text-white' : 'text-blue-100/40'}`}>Credit / Debit</span>
                            </button>
                            <button 
                                onClick={() => setMethod('UPI')}
                                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 group
                                    ${method === 'UPI' ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                `}
                            >
                                <Smartphone className={`h-6 w-6 ${method === 'UPI' ? 'text-primary' : 'text-blue-100/20 group-hover:text-blue-100/40'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${method === 'UPI' ? 'text-white' : 'text-blue-100/40'}`}>UPI / Net</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-[#090e1a]/50 border-t border-white/5">
                    <Button 
                        onClick={handlePayment}
                        disabled={!method || isProcessing}
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing Hub...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                Authorize Transaction
                                <ArrowRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                    <p className="text-center text-[9px] font-bold text-blue-100/10 uppercase tracking-widest mt-4">
                        256-bit encrypted secure clinical transaction
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
