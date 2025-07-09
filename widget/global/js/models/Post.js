/* This is a sample model data created to demonstrate the usage of models within BuildFire plugins,
*  this model includes all the base properties in addition to one method that would generate a data
*  entity with BuildFire indexes.
* */
class Post {
  /**
   * Create a post model.
   * @param {object} data - model value
   */
  constructor(data = {}) {
    this.id = data.id || undefined;
    this.content = data.content || '';
    this.createdOn = data.createdOn || new Date();
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || new Date();
    this.lastUpdatedBy = data.lastUpdatedBy || null;
    this.deletedOn = data.deletedOn || null;
    this.deletedBy = data.deletedBy || null;
    this.isActive = data.isActive || 1;
  }

  /**
   * Convert the model to plain JSON that also includes _buildfire indexes
   * @return {Post} A Post object.
   */
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      createdOn: this.createdOn,
      createdBy: this.createdBy,
      lastUpdatedOn: this.lastUpdatedOn,
      lastUpdatedBy: this.lastUpdatedBy,
      deletedOn: this.deletedOn,
      deletedBy: this.deletedBy,
      isActive: this.isActive,
      _buildfire: {
        index: {
          date1: this.createdOn,
        },
      },
    };
  }
}
