import { ImporterWizard } from '@/components/csv-importer/ImporterWizard';
import { Bot } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 space-y-12 max-w-6xl mx-auto">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 shadow-sm border border-primary/20">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            GrowEasy AI Importer
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Seamlessly map your messy CSV data into structured CRM leads with the power of Gemini AI.
          </p>
        </header>

        <section className="bg-card shadow-2xl rounded-3xl p-6 md:p-12 border border-border/50 backdrop-blur-xl">
          <ImporterWizard />
        </section>
      </div>
    </main>
  );
}
