import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, MonitorPlay, Zap, Megaphone, Handshake, BarChart3, Settings2 } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-black">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 mix-blend-difference">
        <div className="text-xl md:text-2xl font-bold tracking-tighter uppercase font-display text-white">
          Rave'era<span className="text-primary">.</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase text-white">
          <button onClick={() => scrollTo('cases')} className="hover:text-primary transition-colors">Cases</button>
          <button onClick={() => scrollTo('about')} className="hover:text-primary transition-colors">About</button>
          <button onClick={() => scrollTo('services')} className="hover:text-primary transition-colors">Services</button>
          <button onClick={() => scrollTo('team')} className="hover:text-primary transition-colors">Team</button>
          <button onClick={() => scrollTo('contact')} className="text-primary hover:text-white transition-colors">Contact</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 md:px-12 pt-20">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="relative z-10 w-full max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center justify-between"
        >
          <div className="max-w-4xl">
            <motion.div variants={fadeInUp} className="inline-block border border-primary/30 bg-primary/5 text-primary text-xs md:text-sm px-4 py-1.5 rounded-full mb-6 font-mono tracking-widest uppercase">
              Event Agency
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-[140px] font-bold leading-[0.85] tracking-tighter uppercase font-display">
              We Create <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">Impact</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="mt-8 text-lg md:text-2xl text-muted-foreground max-w-2xl font-light">
              A premium global event agency designing conferences, corporate gatherings, and creative live experiences for top-tier clients worldwide.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-12 flex flex-col sm:flex-row items-center gap-6">
              <button onClick={() => scrollTo('contact')} className="group relative px-8 py-4 bg-primary text-black font-bold uppercase tracking-wider overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </button>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="w-12 h-[1px] bg-border" />
                Baltimore, MD
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-muted-foreground hover:text-primary transition-colors"
          onClick={() => scrollTo('cases')}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* Trusted By / Logos */}
      <section className="py-12 border-y border-border bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest whitespace-nowrap">Trusted By</p>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-50 grayscale">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 bg-muted rounded w-full max-w-[120px] mx-auto animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section id="cases" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold uppercase font-display tracking-tighter">Our Cases</motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground mt-4 max-w-md">Moments that moved audiences. Stages that set new standards. Experiences that left a mark.</motion.p>
            </div>
            <motion.button variants={fadeInUp} className="text-sm font-mono tracking-widest uppercase hover:text-primary transition-colors flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { img: "/images/case-1.png", title: "Nexus Global Summit", category: "Conference" },
              { img: "/images/case-2.png", title: "Echo Sound Festival", category: "Live Music" },
              { img: "/images/case-3.png", title: "Aura Gala Dinner", category: "Corporate" }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="group cursor-pointer">
                <div className="relative overflow-hidden aspect-[4/5] bg-muted mb-6">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold font-display uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                  <span className="text-xs font-mono text-muted-foreground uppercase">{item.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 md:px-12 bg-zinc-950 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold uppercase font-display tracking-tighter mb-8">About Us</motion.h2>
              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-6">
                Rave'era Group is a global event management agency. We orchestrate controlled chaos into elegant, unforgettable live experiences.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-base text-muted-foreground leading-relaxed mb-12">
                From intimate corporate gatherings to massive international conferences, we handle every detail with obsessive precision. We don't just build stages; we build environments that command attention and drive results.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex gap-12 border-l-2 border-primary pl-8 py-2">
                <div>
                  <div className="text-4xl font-bold text-white font-display mb-2">150+</div>
                  <div className="text-sm font-mono text-muted-foreground uppercase">Global Events</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white font-display mb-2">12</div>
                  <div className="text-sm font-mono text-muted-foreground uppercase">Countries</div>
                </div>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mt-12"
              >
                <img src="/images/about-1.png" alt="Backstage production" className="w-full aspect-square object-cover" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img src="/images/about-2.png" alt="Stage lighting" className="w-full aspect-[4/5] object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold uppercase font-display tracking-tighter mb-16 text-center">Our Services</motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-8 h-8 text-primary" />,
                title: "Concept & Creativity",
                desc: "Creative concept development, Art direction & scenography, Brand activation planning"
              },
              {
                icon: <Settings2 className="w-8 h-8 text-primary" />,
                title: "Event Production",
                desc: "Full event logistics, Stage design & setup, On-site coordination"
              },
              {
                icon: <MonitorPlay className="w-8 h-8 text-primary" />,
                title: "Tech & Streaming",
                desc: "Live streaming setup, Virtual platforms, Hybrid events"
              },
              {
                icon: <Megaphone className="w-8 h-8 text-primary" />,
                title: "Marketing & Media",
                desc: "Social media campaigns, PR management, Content creation"
              },
              {
                icon: <Handshake className="w-8 h-8 text-primary" />,
                title: "Sponsorship & Partners",
                desc: "Brand partnerships, Investor outreach, Strategic collaborations"
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-primary" />,
                title: "Analytics & Reporting",
                desc: "Performance metrics, ROI analysis, Post-event debriefs"
              }
            ].map((service, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="group p-8 border border-border bg-card hover:border-primary/50 transition-colors duration-300 flex flex-col h-full"
              >
                <div className="mb-6 bg-black/50 p-4 inline-flex w-fit rounded-lg group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold font-display uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mt-auto">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-32 px-6 md:px-12 bg-zinc-950 border-t border-border">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold uppercase font-display tracking-tighter">Our Team</motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground mt-4 max-w-xl mx-auto">The masterminds behind the curtain.</motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { img: "/images/team-1.png", name: "Gregory Peterson", role: "Head of Production" },
              { img: "/images/team-2.png", name: "Melissa Andrews", role: "Creative Director" },
              { img: "/images/team-3.png", name: "Michael Barnes", role: "Event Coordinator" }
            ].map((member, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center text-center group">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-6 border-4 border-black group-hover:border-primary transition-colors duration-500">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" />
                </div>
                <h3 className="text-2xl font-bold font-display uppercase tracking-tight">{member.name}</h3>
                <p className="text-primary font-mono text-xs uppercase tracking-widest mt-2">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 md:px-12 max-w-7xl mx-auto relative">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary blur-[150px] rounded-full mix-blend-screen" />
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <motion.h2 variants={fadeInUp} className="text-5xl md:text-8xl font-bold uppercase font-display tracking-tighter mb-8">
            Ready to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">Collaborate?</span>
          </motion.h2>
          
          <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-8 md:gap-16 mt-8">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Email Us</p>
              <a href="mailto:contact@evans.com" className="text-2xl hover:text-primary transition-colors">contact@evans.com</a>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Visit Us</p>
              <a href="https://www.evans.com" className="text-2xl hover:text-primary transition-colors">www.evans.com</a>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-16 text-left border border-border p-8 bg-black/50 backdrop-blur-sm max-w-md w-full">
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-4">Headquarters</p>
            <p className="text-lg leading-relaxed">
              900 West 20th Street,<br/>
              Suite 1001,<br/>
              Baltimore, MD 21202
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-border bg-black text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm font-bold font-display uppercase tracking-wider">
          Rave'era<span className="text-primary">.</span>
        </div>
        <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
          © 2024 Rave'era Group. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
