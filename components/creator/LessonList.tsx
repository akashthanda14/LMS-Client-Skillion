'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, Edit2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lessonAPI, LessonDetail } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LessonListProps {
  lessons: LessonDetail[];
  onLessonsUpdated: () => void;
}

export function LessonList({ lessons, onLessonsUpdated }: LessonListProps) {
  const [localLessons, setLocalLessons] = useState<LessonDetail[]>(lessons);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when props change
  useState(() => {
    setLocalLessons(lessons);
  });

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localLessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UI
    setLocalLessons(items);

    try {
      // Update order on backend
      await lessonAPI.updateLesson(reorderedItem.id, {
        order: result.destination.index + 1,
      });
      
      // Refresh the full list to ensure consistency
      onLessonsUpdated();
    } catch (error) {
      console.error('Failed to reorder lesson:', error);
      // Revert on error
      setLocalLessons(lessons);
      alert('Failed to reorder lesson. Please try again.');
    }
  };

  const handleStartEdit = (lesson: LessonDetail) => {
    setEditingId(lesson.id);
    setEditTitle(lesson.title);
  };

  const handleSaveEdit = async (lessonId: string) => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      await lessonAPI.updateLesson(lessonId, { title: editTitle.trim() });
      setEditingId(null);
      onLessonsUpdated();
    } catch (error: any) {
      console.error('Failed to update lesson:', error);
      alert(error.response?.data?.message || 'Failed to update lesson');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = async (lessonId: string) => {
    setIsUpdating(true);
    try {
      await lessonAPI.deleteLesson(lessonId);
      setDeleteConfirm(null);
      onLessonsUpdated();
    } catch (error: any) {
      console.error('Failed to delete lesson:', error);
      alert(error.response?.data?.message || 'Failed to delete lesson');
    } finally {
      setIsUpdating(false);
    }
  };

  if (localLessons.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No lessons yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Upload your first video lesson to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lessons">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
              }`}
            >
              {localLessons.map((lesson, index) => (
                <Draggable
                  key={lesson.id}
                  draggableId={lesson.id}
                  index={index}
                  isDragDisabled={editingId !== null || isUpdating}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white border rounded-lg transition-shadow ${
                        snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                      }`}
                    >
                      <div className="p-4 flex items-center gap-3">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Lesson Number */}
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>

                        {/* Lesson Title */}
                        <div className="flex-1 min-w-0">
                          {editingId === lesson.id ? (
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveEdit(lesson.id);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                              maxLength={200}
                              disabled={isUpdating}
                            />
                          ) : (
                            <p className="font-medium text-gray-900 truncate">
                              {lesson.title}
                            </p>
                          )}
                          {lesson.videoUrl && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Video uploaded
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                          {editingId === lesson.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(lesson.id)}
                                disabled={isUpdating || !editTitle.trim()}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(lesson)}
                                disabled={isUpdating}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirm(lesson.id)}
                                disabled={isUpdating}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
              The video will be permanently removed from the course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
