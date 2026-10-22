import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

/**
 * Base custom SweetAlert2 instance styled with TutorFlow soft-pastel design system
 */
export const TutorFlowSwal = Swal.mixin({
  customClass: {
    popup: 'tf-swal-popup',
    title: 'tf-swal-title',
    htmlContainer: 'tf-swal-html',
    confirmButton: 'tf-swal-confirm-btn',
    cancelButton: 'tf-swal-cancel-btn',
    actions: 'tf-swal-actions'
  },
  buttonsStyling: false,
  showCancelButton: true,
  cancelButtonText: 'Cancel',
  reverseButtons: true,
  focusCancel: false
});

/**
 * Confirm a critical deletion action (Red theme)
 */
export async function confirmDelete(
  title: string, 
  text: string, 
  confirmText: string = 'Yes, Delete'
): Promise<boolean> {
  const result = await TutorFlowSwal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: confirmText,
    customClass: {
      popup: 'tf-swal-popup',
      title: 'tf-swal-title',
      htmlContainer: 'tf-swal-html',
      confirmButton: 'tf-swal-confirm-danger-btn',
      cancelButton: 'tf-swal-cancel-btn',
      actions: 'tf-swal-actions'
    }
  });
  return result.isConfirmed;
}

/**
 * Confirm a status change or workflow progression (Themed based on role and status)
 */
export async function confirmStatusTransition(
  taskTitle: string,
  newStatus: string,
  role: 'student' | 'tutor'
): Promise<boolean> {
  let title = `Update Status to "${newStatus.toUpperCase()}"?`;
  let text = `Transition task "${taskTitle}" to ${newStatus}.`;
  let confirmText = 'Confirm Update';
  let isSuccess = false;
  let isDanger = false;
  let icon: 'question' | 'success' | 'warning' | 'info' = 'question';

  if (newStatus === 'done') {
    title = 'Verify & Mark Task as Complete?';
    text = `Are you sure you want to verify and complete "${taskTitle}"? Both tutor and student will be notified.`;
    confirmText = 'Yes, Complete Task';
    isSuccess = true;
    icon = 'success';
  } else if (newStatus === 'ongoing') {
    if (role === 'student') {
      title = 'Start Working on Task?';
      text = `Begin learning and practice for "${taskTitle}". Your timeline status will move to Ongoing.`;
      confirmText = 'Start Working';
      icon = 'info';
    } else {
      title = 'Re-open Task?';
      text = `Re-open "${taskTitle}" for further student practice and revisions.`;
      confirmText = 'Re-open Task';
      icon = 'warning';
    }
  } else if (newStatus === 'update raised') {
    title = 'Raise Update / Ask Question?';
    text = `Submit problem questions and screenshots for tutor triage on "${taskTitle}".`;
    confirmText = 'Submit Update';
    isDanger = true;
    icon = 'warning';
  }

  const result = await TutorFlowSwal.fire({
    title,
    text,
    icon,
    confirmButtonText: confirmText,
    customClass: {
      popup: 'tf-swal-popup',
      title: 'tf-swal-title',
      htmlContainer: 'tf-swal-html',
      confirmButton: isSuccess 
        ? 'tf-swal-confirm-success-btn' 
        : (isDanger ? 'tf-swal-confirm-danger-btn' : 'tf-swal-confirm-btn'),
      cancelButton: 'tf-swal-cancel-btn',
      actions: 'tf-swal-actions'
    }
  });

  return result.isConfirmed;
}

/**
 * Generic confirmation modal for general actions
 */
export async function confirmAction(options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  icon?: 'warning' | 'question' | 'info' | 'success';
  isDanger?: boolean;
  isSuccess?: boolean;
}): Promise<boolean> {
  const { title, text = '', confirmButtonText = 'Confirm', icon = 'question', isDanger = false, isSuccess = false } = options;

  const result = await TutorFlowSwal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    customClass: {
      popup: 'tf-swal-popup',
      title: 'tf-swal-title',
      htmlContainer: 'tf-swal-html',
      confirmButton: isDanger 
        ? 'tf-swal-confirm-danger-btn' 
        : (isSuccess ? 'tf-swal-confirm-success-btn' : 'tf-swal-confirm-btn'),
      cancelButton: 'tf-swal-cancel-btn',
      actions: 'tf-swal-actions'
    }
  });

  return result.isConfirmed;
}

/**
 * Success modal / toast
 */
export async function showSuccessModal(title: string, text?: string): Promise<void> {
  await Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    customClass: {
      popup: 'tf-swal-popup',
      title: 'tf-swal-title',
      htmlContainer: 'tf-swal-html'
    }
  });
}

/**
 * Error alert modal
 */
export async function showErrorModal(title: string, text?: string): Promise<void> {
  await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Understood',
    buttonsStyling: false,
    customClass: {
      popup: 'tf-swal-popup',
      title: 'tf-swal-title',
      htmlContainer: 'tf-swal-html',
      confirmButton: 'tf-swal-confirm-danger-btn'
    }
  });
}
