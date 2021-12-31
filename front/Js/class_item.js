exports class Item {
	constructor(id,imgurl,altTxt,prod_name,prod_descript){
		this.id = id;
		this.imgurl = imgurl;
		this.altTxt = altTxt;
		this.prod_name = prod_name;
		this.prod_descript = prod_descript;
	}

	Qty(){
		return this;
	}
}

