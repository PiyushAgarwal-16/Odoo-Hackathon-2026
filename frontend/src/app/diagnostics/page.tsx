'use client';

export default function DiagnosticsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const testConnection = async () => {
        try {
            const response = await fetch(`${apiUrl || 'http://localhost:5000/api'}`);
            const data = await response.json();
            console.log('API Response:', data);
            alert('API Connected! Check console for details.');
        } catch (error) {
            console.error('API Error:', error);
            alert('API Connection Failed! Check console for details.');
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Deployment Diagnostics</h1>
                
                <div className="bg-card p-6 rounded-lg border space-y-4">
                    <h2 className="text-xl font-semibold">Environment Check</h2>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <span className="font-medium">NEXT_PUBLIC_API_URL:</span>
                            <code className="text-sm bg-background px-2 py-1 rounded">
                                {apiUrl || '❌ NOT SET'}
                            </code>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <span className="font-medium">Expected Value:</span>
                            <code className="text-sm bg-background px-2 py-1 rounded text-xs">
                                https://odoo-hackathon-2026-production.up.railway.app/api
                            </code>
                        </div>
                    </div>

                    <button
                        onClick={testConnection}
                        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90"
                    >
                        Test API Connection
                    </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ If NEXT_PUBLIC_API_URL is NOT SET:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                        <li>Go to Vercel Dashboard → Your Project</li>
                        <li>Settings → Environment Variables</li>
                        <li>Add: <code className="bg-yellow-100 px-1">NEXT_PUBLIC_API_URL</code></li>
                        <li>Value: <code className="bg-yellow-100 px-1 text-xs">https://odoo-hackathon-2026-production.up.railway.app/api</code></li>
                        <li>Apply to: Production, Preview, Development</li>
                        <li>Redeploy your application</li>
                    </ol>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Quick Links:</h3>
                    <div className="space-y-2 text-sm">
                        <a href="/" className="block text-primary hover:underline">
                            ← Back to Home
                        </a>
                        <a href="/signin" className="block text-primary hover:underline">
                            → Go to Sign In
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
