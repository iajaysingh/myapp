require 'yaml'
module Invoicer
    class Invoice
      def initialize
        begin
          #initializing Invoice object and loading input file
          @baskets = YAML::load_file(File.join(__dir__,'input_baskets.yml'))
        rescue => e
          Rails.logger.info "Input file missing."
        end
      end

      def baskets
        #returns the baskets and list items
        return @baskets if @baskets.present?
        return "Input file missing"
      end

      def generate
        puts "Input file missing. Invoice cannot be generated" and return if @baskets.blank?
        puts "Invoice Details: \r\n"
        #iterating over the baskets
        @baskets["baskets"].keys.each do |basket|
          puts "**" * 40
          puts "#{basket} Invoice follows :: (Currency - INR)"
          invoice, tax = compute(@baskets["baskets"][basket])
          if invoice > 0
            puts "#{basket} Total Tax                                      :: #{tax} INR"
            puts "#{basket} Billing Amount(VAT & Additional Tax inclusive) :: #{invoice} INR"
          else
            puts "#{basket} :: No items present in the basket."
          end
          puts "**" * 40
        end
      end

      private
      def compute items
        total_tax = 0
        total_updated_price = 0
        return [0, 0] if items["items"].keys.blank?
        #iterating over the list items and computing individual taxes and total tax
        items["items"].keys.each_with_index do |item, index|
          #get the list of taxes to be applied
          taxes_to_apply = applicable_taxes(items["items"][item]["type"].split(','))
          itemized_tax = 0
          begin
            #calculate cumulative tax
            name = items["items"][item]['name']
            price = items["items"][item]['price'].to_f
            puts "Item ##{index+1}"
            puts " " * 5 + "#{name} price(tax exclusive) :: #{price.round(2)} INR"
            taxes_to_apply.each do |tax_rate|
              itemized_tax += tax_amount(price, tax_rate)
            end
          rescue => ex
            puts "****Price of the item #{name} unspecified.****"
          end
          #Updated price(inclusive of tax)
          updated_price = price + itemized_tax
          puts " " * 5 + "#{name} price(tax inclusive) :: #{updated_price.round(2)} INR"
          total_tax += itemized_tax
          total_updated_price += updated_price
        end
        #returning updated price and total tax computed on all items
        [total_updated_price.round(2), total_tax.round(2)]
      end

      def applicable_taxes type
        taxes_inclusive = []
        #Pushing tax rate for imported goods.
        if type.include?("imported")
          taxes_inclusive.push(2.4)
        end
        #Pushing tax rate for other or imported goods
        if type.include?("other") or type.include?("imported")
          taxes_inclusive.push(12.5)
        end
        return taxes_inclusive
      end

      def tax_amount price, tax_rate
        #computing tax on list item
        return 0 if price.blank? or tax_rate.blank?
        amount = price * (tax_rate/100)
        return amount
      end
    end
end
