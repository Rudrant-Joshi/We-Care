/**
 * Review Model
 */

export class Review {
  constructor({
    id = 'rev_' + Math.random().toString(36).substring(2, 9),
    targetType = 'equipment', // 'equipment' | 'doctor'
    targetId,
    targetName,
    userName,
    userEmail,
    rating = 5,
    comment = '',
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.targetType = targetType;
    this.targetId = targetId;
    this.targetName = targetName;
    this.userName = userName;
    this.userEmail = userEmail;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt;
  }
}

export const inMemoryReviews = [
  new Review({
    targetType: 'equipment',
    targetId: 'eq-mri-3t',
    targetName: '3.0 Tesla High-Field MRI Scanner',
    userName: 'Dr. Bruce Banner',
    userEmail: 'bruce.banner@wecare.health',
    rating: 5,
    comment: 'Exceptional resolution on deep-subcortical imaging. Zero acoustic artifacts noted.'
  })
];

export default Review;
