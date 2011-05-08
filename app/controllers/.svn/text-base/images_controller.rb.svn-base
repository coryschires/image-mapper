class ImagesController < ApplicationController

  def new

    @uploaded_image = session[:uploaded_image] unless session[:uploaded_image].blank?

    @image = Image.new

    respond_to do |format|
      format.html
      format.xml  { render :xml => @image }
    end
  end

  def create
    @image = Image.new(params[:image])
    respond_to do |format|
      if @image.save
        session[:uploaded_image] = @image
        format.html { redirect_to root_url }
        format.xml  { render :xml => @image, :status => :created, :location => @image }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @image.errors, :status => :unprocessable_entity }
      end
    end
  end

end
