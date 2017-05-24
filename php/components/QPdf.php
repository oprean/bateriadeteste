<?php
require_once TCPDF_LIBRARY_PATH;

class QPdf extends TCPDF {
	
	private $pdf;
	private $_data;
    private $_filename;
	
	function __construct($data) {
		$this->_data = $data;
		//$this->pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
		$this->SetCompression(true);		
		$this->setFontSubsetting(false);
		$this->SetCreator(PDF_CREATOR);
		$this->SetAuthor("Bateria de teste");
		$this->SetTitle($this->_data->title);

		parent::__construct();
	}
	
    public function GetFilename() {
        return $this->_filename;
    }
    
    private function SetFilename($dest='F') {
        $this->_filename = $dest=='F'?RUNTIME_DIR:'';
        $this->_filename .= preg_replace('/[^a-zA-Z0-9]/', '_', $this->_data->title);
        switch ($this->_data->type) {
            case 'mail.result':
                $this->_filename .= '_'.$this->_data->username.'_user_result';
                break;
            case 'result':
                $this->_filename .= '_'.$this->_data->more->user['username'].'_user_result';                
                break;            
            default:
                $this->_filename .= '_'.$this->_data->type;                
                break;
        }
		
		$this->_filename .= '.pdf';
    }
    
    public function Header() {
        // Title
        $image_file = '../assets/img/logo.png';
        $this->Image($image_file, 10, 5, 0, 9, 'png', '', 'T', false, 300, '', false, false, 0, false, false, false);
        $this->SetFont('dejavusans', '', 12);
        $this->SetTextColor(128,128,128);
        $this->Cell(0, 18, $this->_data->title, 0, false, 'L', 0, '', 0, false, 'M', 'B');
		//$this->Cell(0, 15, 'Terminat '.$this->input->data->date, 0, false, 'R', 0, '', 0, false, 'M', 'B');
		$style = array('width' => 0.1, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => array(128, 128, 128));
		$this->Line(10, 16, 200, 16, $style);
    }

    // Page footer
    public function Footer() {
        // Position at 15 mm from bottom
        $this->SetY(-15);
        $this->SetFont('dejavusans', '', 8);
		$this->SetTextColor(128,128,128);
        // Page number
		$this->Cell(0, 15, $this->getAliasNumPage().'/'.$this->getAliasNbPages(), 0, false, 'L', 0, '', 0, false, 'M', 'B');
		$this->Cell(0, 15, 'generat in '.date('d-M-Y h:i:s'), 0, false, 'R', 0, '', 0, false, 'M', 'B');
        $style = array('width' => 0.1, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => array(128, 128, 128));
        $this->Line(10, $this->getPageHeight()-12, 200, $this->getPageHeight()-12, $style);
    }
	
	function generate($dest = 'F') {
		$this->SetMargins(PDF_MARGIN_LEFT, 17, PDF_MARGIN_RIGHT);
		$this->SetHeaderMargin(PDF_MARGIN_HEADER);
        $this->SetFont('dejavusans', '', 12);
		$this->AddPage();
$html = <<<EOF
<style> 
</style>
EOF;
		$html .= $this->_data->html;		
		$this->writeHTMLCell(0, 0, '', '', $html, 0, 1, 0, true, '', true);
        
        $this->SetFilename($dest);
		$this->Output($this->_filename, $dest);
		
		//http://labs.omniti.com/labs/jsend
		if ($dest=='F') {
            if (file_exists($this->_filename)) {
                $result = array(
                    'status' => 'success',
                    'data' => array(
                        'filename' => $this->_filename,
                        'name' => $this->_data->title, 
                        'message' => 'PDF generated succesfully!',
                    )
                ); 
            } else {
                $result = array(
                    'status' => 'error',
                    'data' => array(
                        'message' => 'Failed to create PDF file', 
                    )
                );
            }   
            return $result;    
		}
	}
}
?>
