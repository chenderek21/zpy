from PIL import Image, ImageDraw, ImageFont
import os
#creates png images of the cards in src > frontend > assets > cards
def create_card(rank, suit, filename):
    # Card dimensions
    width, height = 200, 280
    
    # Create a new white image
    card = Image.new("RGB", (width, height), "white")
    card = round_corners(card, 20)  # 20 is the radius; adjust as needed

    draw = ImageDraw.Draw(card)
    
    # Set font paths to the public/fonts directory
    font_path_suit = os.path.join("src", "frontend", "fonts", "ARIAL.ttf")
    font_path_rank = os.path.join("src", "frontend", "fonts", "ARLRDBD.ttf")
    font_size_rank = 60
    font_size_suit = 70
    font_size_large = 160

    suit_hscale = 0.9
    suit_hoffset = 0
    suit_voffset = 0
    if suit in {'♦'}:
        suit_hscale = 1.1
        suit_hoffset = 0
    if suit in {'♠'}:
        font_size_large = 176
        font_size_suit = 77
        suit_voffset = 3
        suit_hoffset = 0
        suit_hscale = 1.02
    if suit in {'♥'}:
        suit_hoffset = 2

        suit_hscale = 1.05
    font_rank = ImageFont.truetype(font_path_rank, font_size_rank)
    font_suit = ImageFont.truetype(font_path_suit, font_size_suit)
    font_suit_large = ImageFont.truetype(font_path_suit, font_size_large)
    # Place rank and suit on card
    color = "red" if suit in {'♥','♦'} else "black"

    rank_hscale = 1.0
    rank_hoffset = 0
    if rank in {'K', 'A'}:
        rank_hscale = 0.9
    if rank in {'J'}:
        rank_hoffset = -2
    if rank in {'Q'}:
        rank_hscale = 0.85
        rank_hoffset = 2
    # joker logic
    if rank == 'joker':
        font_size_rank=50
        font_rank = ImageFont.truetype(font_path_rank, font_size_rank)
        color = suit
        height = 0
        for letter in ['J','O','K','E','R']:
            if letter not in {'J'}:
                rank_hscale = 0.9
                rank_hoffset = 0
            else:
                rank_hoffset = -4
            draw_scaled_text(card, (10-rank_hoffset, height), letter, font_rank, rank_hscale, fill=color)
            height += 43
        add_joker_image_to_card(card, "src/frontend/assets/images/joker_"+color+".png")
        save_path = os.path.join("src", "frontend", "assets", "cards", filename)

        card.save(save_path)
        return

    draw_scaled_text(card, (width//2-20, height//2-40-suit_voffset), suit, font_suit_large, suit_hscale, fill=color)
    if rank != '10':
        draw_scaled_text(card, (10-rank_hoffset, 0), rank, font_rank, rank_hscale, fill=color)
    else:
        draw_scaled_text(card, (4, 0), '1', font_rank, 0.75, fill=color)
        draw_scaled_text(card, (25, 0), '0', font_rank, 0.8, fill=color)
    draw_scaled_text(card, (10-suit_hoffset, 45-suit_voffset), suit, font_suit, suit_hscale, fill=color)
    save_path = os.path.join("src", "frontend", "assets", "cards", filename)
    card.save(save_path)

def draw_scaled_text(image, position, text, font, scale_x, **kwargs):
    # Create a temporary image with space for the text
    temp_img = Image.new('RGBA', (font.getbbox(text)[2], font.getbbox(text)[3]), (255, 255, 255, 0))
    draw_temp = ImageDraw.Draw(temp_img)
    draw_temp.text((0, 0), text, font=font, **kwargs)
    
    # Scale the temporary image
    width, height = temp_img.size
    temp_img = temp_img.resize((int(width * scale_x), height))
    
    # Paste the scaled image onto the main image
    image.paste(temp_img, position, temp_img)

def add_joker_image_to_card(card, joker_img_path):
    # Open the Joker PNG image
    joker_img = Image.open(joker_img_path)
    
    # Resize the Joker image if necessary
    joker_img = joker_img.resize((card.width // 2, card.height // 2))

    # Calculate the position to paste it (centered on the card)
    x = (card.width - joker_img.width//2) // 2
    y = (card.height - joker_img.height//2) // 2 + 20

    # Paste the Joker image onto the card (using the alpha channel of joker_img for transparency)
    card.paste(joker_img, (x, y), joker_img)

def round_corners(im, rad):
    # Round the corners of an image
    circle = Image.new('L', (rad * 2, rad * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, rad * 2, rad * 2), fill=255)
    alpha = Image.new('L', im.size, 255)
    w,h = im.size
    alpha.paste(circle.crop((0, 0, rad, rad)), (0, 0))
    alpha.paste(circle.crop((0, rad, rad, rad * 2)), (0, h - rad))
    alpha.paste(circle.crop((rad, 0, rad * 2, rad)), (w - rad, 0))
    alpha.paste(circle.crop((rad, rad, rad * 2, rad * 2)), (w - rad, h - rad))
    im.putalpha(alpha)
    return im


# Define ranks and suits
ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
suits = ['♥', '♦', '♣', '♠']  # Replace with suit symbols or icons if desired
suit_dict = {'♥':'hearts', '♦':'diamonds', '♣':'clubs', '♠':'spades'}
# Generate cards
for suit in suits:
    for rank in ranks:
        filename = f"{rank}_of_{suit_dict[suit]}.png"
        create_card(rank, suit, filename)

# Jokers
create_card("joker", "red", "joker_red.png")
create_card("joker", "black", "joker_black.png")

