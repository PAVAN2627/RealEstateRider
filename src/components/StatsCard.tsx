import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  index?: number;
}

const StatsCard = ({ icon: Icon, label, value, change, positive = true, index = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl bg-card p-6 shadow-card hover:shadow-elevated transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold font-heading text-card-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
};

export default StatsCard;
