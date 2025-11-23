// app/dashboard/student/feedback/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { feedbackAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface AttendedEvent {
  id: number;
  title: string;
  date_time: string;
  has_feedback: boolean;
}

export default function FeedbackPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [attendedEvents, setAttendedEvents] = useState<AttendedEvent[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated && user?.profile?.user_type !== 'student') {
      router.push('/dashboard');
      return;
    }
    if (isAuthenticated) {
      fetchAttendedEvents();
    }
  }, [authLoading, isAuthenticated, user, router]);

  interface ApiError {
    response?: {
      status?: number;
      data?: {
        event?: string[];
        error?: string;
        detail?: string;
        message?: string;
        [key: string]: unknown;
      };
    };
    message?: string;
  }

  const fetchAttendedEvents = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getAttendedEvents();
      setAttendedEvents(response.data || []);
    } catch (error: unknown) {
      console.error('Error fetching attended events:', error);
      setError('Failed to load attended events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedEventId) {
      setError('Please select an event');
      return;
    }

    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    try {
      setSubmitting(true);
      const feedbackData: { event: number; rating: number; comment?: string } = {
        event: selectedEventId,
        rating: rating,
      };
      
      // Only include comment if it's not empty
      if (comment.trim()) {
        feedbackData.comment = comment.trim();
      }
      
      await feedbackAPI.createFeedback(feedbackData);
      
      setSuccess('Feedback submitted successfully!');
      setRating(0);
      setComment('');
      setSelectedEventId(null);
      
      // Refresh the attended events list to update has_feedback status
      fetchAttendedEvents();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error);
      const apiError = error as ApiError;
      
      // Log full error for debugging
      console.error('Full error response:', JSON.stringify(apiError.response?.data, null, 2));
      console.error('Error status:', apiError.response?.status);
      
      // Handle different error response formats
      let errorMessage = 'Failed to submit feedback. Please try again.';
      
      if (apiError.response?.data) {
        const errorData = apiError.response.data;
        
        // DRF ValidationError format - field errors as arrays
        if (errorData.event) {
          if (Array.isArray(errorData.event)) {
            errorMessage = errorData.event[0];
          } else if (typeof errorData.event === 'string') {
            errorMessage = errorData.event;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          // Try to extract any error message from the response
          const errorKeys = Object.keys(errorData);
          if (errorKeys.length > 0) {
            const firstKey = errorKeys[0];
            const firstError = errorData[firstKey];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = String(firstError[0]);
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            } else {
              // Last resort - stringify the whole error
              errorMessage = `Error: ${JSON.stringify(errorData)}`;
            }
          }
        }
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEvent = attendedEvents.find(e => e.id === selectedEventId);

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Event Feedback</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Share your experience and help us improve future events
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Feedback Form */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Feedback
          </CardTitle>
          <CardDescription>
            Select an attended event and share your thoughts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendedEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Attended Events
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                You have not attended any events yet. Once you attend an event, you will be able to provide feedback here.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Selection */}
              <div className="space-y-2">
                <Label htmlFor="event" className="text-slate-700 dark:text-slate-300">
                  Select Event *
                </Label>
                <Select
                  value={selectedEventId?.toString() || ''}
                  onValueChange={(value) => {
                    setSelectedEventId(parseInt(value));
                    setError('');
                    setSuccess('');
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Choose an attended event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {attendedEvents.map((event) => (
                      <SelectItem 
                        key={event.id} 
                        value={event.id.toString()}
                        disabled={event.has_feedback}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{event.title}</span>
                          {event.has_feedback && (
                            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                              (Feedback submitted)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEvent && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedEvent.date_time).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Rating *
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        setError('');
                      }}
                      disabled={submitting}
                      className={`transition-all ${
                        star <= rating
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400'
                      } ${submitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                      {rating} {rating === 1 ? 'star' : 'stars'}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-slate-700 dark:text-slate-300">
                  Comments (Optional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Share your thoughts about the event..."
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setError('');
                  }}
                  disabled={submitting}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[120px]"
                  rows={5}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {comment.length} characters
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !selectedEventId || rating === 0 || (selectedEvent?.has_feedback)}
                className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Previous Feedback Section */}
      {attendedEvents.filter(e => e.has_feedback).length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Your Feedback History</CardTitle>
            <CardDescription>
              Events you&apos;ve already provided feedback for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendedEvents
                .filter(e => e.has_feedback)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date_time).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Feedback submitted</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

