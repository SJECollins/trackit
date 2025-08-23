import HabitForm from "@/components/habitForm";

export default function EditTask({ habitId }: { habitId: string | null }) {
  return <HabitForm habitId={habitId} />;
}
