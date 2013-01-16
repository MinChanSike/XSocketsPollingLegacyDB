1. Create you DomainModel in the Model folder of the CORE project, at the end of this file is a simple example of two classes realting to each other.

2. Compile

3. Open the Package Manager Console.

4. Scaffold your system by writing "Scaffold CodePlanner.ScaffoldAll" if you use CodePlanner.MVC3, or "CodePlanner.ScaffoldBackend" if you only use the CodePlanner package.

5. Hit F5 to run your new system.

Remember:
- Add DisplayColumn attribute on your entities. Or else you will get a scaffolding error.

News:
- Added paging
- Added better forms rendering, bool will become checkbox, int with range will become slider etc...
- Force is now working

Known Issues:
- The scaffolder cant handle mantToMany relations in the views. Work around: Add the mapping tables into your model.
- [CodePlanner.ScaffoldAll] This scaffolder can not find entitites to scaffold if the files containing your domainmodel is closed in visual studio.
	Fix: Open the domainmodel files before calling [CodePlanner.ScaffoldAll]

	//EXAMPLE DOMAIN MODEL
    [Serializable]
    [DataContract]
    [DisplayColumn("Name")]
    public partial class Factory : PersistentEntity
    {
        [DataMember]
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [DataMember]
        [Required]
        [MaxLength(100)]
        public string Location { get; set; }

        [DataMember]
        public virtual IList<Product> Products { get; set; }
    }

    [Serializable]
    [DataContract]
    [DisplayColumn("Name")]
    public partial class ProductCategory : PersistentEntity
    {
        [DataMember]
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [DataMember]
        [Required]
        [MaxLength(100)]
        public string Description { get; set; }

        [DataMember]
        public virtual IList<Product> Products { get; set; }
    }

    [Serializable]
    [DataContract]
    [DisplayColumn("Name")]
    public partial class Product : PersistentEntity
    {
        [DataMember]
        [MaxLength(50)]
        [MinLength(5)]
        [Required]
        public string Name { get; set; }

        [DataMember]
        [MaxLength(200)]
        [DataType(DataType.MultilineText)]
        public string Information { get; set; }

		[DataMember]        
        public int ProductNumber { get; set; }
        
        [DataMember]
        [Range(50, 500)]
        public int Price { get; set; }

        [DataMember]
        public bool Active { get; set; }

        [DataMember]
        [Required]
        public int ProductCategoryId { get; set; }
        [DataMember]
        [ForeignKey("ProductCategoryId")]
        public virtual ProductCategory ProductCategory { get; set; }

        [DataMember]
        [Required]
        public int FactoryId { get; set; }
        [DataMember]
        [ForeignKey("FactoryId")]
        public virtual Factory Factory { get; set; }

        public override IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (this.FactoryId == 0)
                yield return new ValidationResult("Factory is required!", new[] { "FactoryId" });
            if (this.ProductCategoryId == 0)
                yield return new ValidationResult("ProductCategory is required!", new[] { "ProductCategoryId" });
        }
    }