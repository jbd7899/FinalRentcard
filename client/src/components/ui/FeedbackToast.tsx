import { Star } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface FeedbackToastProps {
  interaction: string;
  onSubmit?: (rating: number) => void;
}

export const FeedbackToast = ({ interaction, onSubmit }: FeedbackToastProps) => {
  const { setLastRating, setLastInteraction } = useUIStore((state) => state.feedback);
  const { addToast } = useUIStore();

  const handleRating = (rating: number) => {
    setLastRating(rating);
    setLastInteraction(interaction);
    
    // Call onSubmit if provided
    onSubmit?.(rating);

    // Show thank you toast
    addToast({
      title: 'Thank you!',
      description: 'Your feedback helps us improve.',
      type: 'success',
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">How was your experience?</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            className="hover:scale-110 transition-transform"
          >
            <Star
              className="w-5 h-5 text-blue-600"
              fill="none"
              strokeWidth={2}
              data-filled={star}
            />
          </button>
        ))}
      </div>
    </div>
  );
}; 