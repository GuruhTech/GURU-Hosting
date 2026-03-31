export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 mt-auto">
      <div className="container mx-auto px-4 text-center md:text-left md:flex justify-between items-center text-muted-foreground text-sm">
        <div>
          <p>© {new Date().getFullYear()} GURU HOST. All rights reserved.</p>
          <p className="mt-1">Premium 24/7 WhatsApp Bot Hosting.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center justify-center gap-4">
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
