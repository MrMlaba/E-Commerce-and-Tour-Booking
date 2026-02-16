import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentProofUrl: string;
  orderNumber: string;
}

export const PdfViewerModal = ({ isOpen, onClose, paymentProofUrl, orderNumber }: PdfViewerModalProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && paymentProofUrl) {
      generateSignedUrl();
    }
  }, [isOpen, paymentProofUrl]);

  const generateSignedUrl = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract the file path from the URL
      const url = new URL(paymentProofUrl);
      const pathParts = url.pathname.split('/');
      const bucketName = pathParts[2]; // 'payment-proofs'
      const filePath = pathParts.slice(3).join('/'); // Everything after bucket name
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Supabase storage error:', error);
        setError('Failed to load PDF document');
        return;
      }
      
      setSignedUrl(data.signedUrl);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      setError('Failed to load PDF document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (signedUrl) {
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = `payment-proof-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment Proof - {orderNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {signedUrl && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInNewTab}
                    className="flex items-center gap-2"
                  >
                    Open in New Tab
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-6">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading PDF document...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-destructive mb-2">{error}</p>
                <Button
                  variant="outline"
                  onClick={generateSignedUrl}
                  disabled={loading}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {signedUrl && !loading && !error && (
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              <iframe
                src={signedUrl}
                className="w-full h-full"
                title={`Payment Proof - ${orderNumber}`}
                onError={() => setError('Failed to display PDF document')}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
